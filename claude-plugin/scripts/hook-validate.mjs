// PostToolUse hook entrypoint: Claude Code passes the tool call as JSON on
// stdin, so we read the edited file path from there (no shell substitution is
// applied to the hook command). We validate only FastYoke FSM-schema files and
// stay silent otherwise, so the hook is a quiet no-op for unrelated edits.
//
// On a validation failure it prints the errors to stderr and exits non-zero,
// which surfaces them as feedback in the session. On anything it can't
// interpret it exits 0 — a lint hook must never block or spam the user.

import fs from 'node:fs';
import { validateApp } from './fy-validate.mjs';

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

// Pull the edited file path out of the PostToolUse payload, tolerating field
// shape differences across Claude Code versions.
function extractPath(payload) {
  const ti = payload.tool_input || payload.toolInput || {};
  return (
    ti.file_path || ti.filePath || ti.path || payload.file_path || payload.path || ''
  );
}

const isFsmSchema = (p) => /fsm.*schema.*\.json$/i.test(p) || /schema.*fsm.*\.json$/i.test(p);

const raw = readStdin();
let path = '';
try {
  path = extractPath(JSON.parse(raw));
} catch {
  process.exit(0); // not JSON we understand → silent no-op
}

if (!path || !isFsmSchema(path) || !fs.existsSync(path)) {
  process.exit(0);
}

let app;
try {
  app = JSON.parse(fs.readFileSync(path, 'utf8'));
} catch (e) {
  console.error(`fy-validate: ${path} is not valid JSON: ${e.message}`);
  process.exit(2);
}

const { ok, errors } = validateApp(app);
if (!ok) {
  console.error(`fy-validate found issues in ${path}:`);
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(2);
}
process.exit(0);
