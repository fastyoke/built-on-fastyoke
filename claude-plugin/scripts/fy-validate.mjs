import fs from 'node:fs';

// Validate a FastYoke FSM schema object. Returns { ok, errors[] }.
export function validateApp(app) {
  const errors = [];
  const states = new Set(app.states || []);
  const transitions = app.transitions || [];

  // unknown-target: every from/to must be a declared state
  for (const t of transitions) {
    for (const key of ['from', 'to']) {
      if (!states.has(t[key])) errors.push(`unknown-target: transition "${t.event}" ${key}="${t[key]}" is not a declared state`);
    }
  }

  // cancelled-state: cancellation must use the admin override, never a graph state
  for (const s of states) {
    if (/^cancell?ed$/i.test(s)) {
      const usedAsTarget = transitions.some(t => t.to === s);
      if (usedAsTarget) errors.push(`cancelled-state: "${s}" is targeted by a transition; model cancellation via the admin override, not the FSM graph`);
    }
  }

  // unbounded-self-loop: from == to must carry a guard
  for (const t of transitions) {
    if (t.from === t.to && (t.guard === undefined || t.guard === null)) {
      errors.push(`unbounded-self-loop: transition "${t.event}" (${t.from}->${t.to}) has no guard; self-loops must be bounded`);
    }
  }

  // raw-guard: guards must be JSONLogic objects, not strings
  for (const t of transitions) {
    if (typeof t.guard === 'string') {
      errors.push(`raw-guard: transition "${t.event}" guard is a string; use a JSONLogic object`);
    }
  }

  // unreachable-state: BFS from initial_state over transition targets
  const reachable = new Set([app.initial_state]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const t of transitions) {
      if (reachable.has(t.from) && !reachable.has(t.to)) { reachable.add(t.to); grew = true; }
    }
  }
  for (const s of states) {
    if (!reachable.has(s)) errors.push(`unreachable-state: "${s}" is not reachable from initial_state "${app.initial_state}"`);
  }

  return { ok: errors.length === 0, errors };
}

// CLI: node fy-validate.mjs <fsm.schema.json>
if (import.meta.url === `file://${process.argv[1]}`) {
  const path = process.argv[2];
  if (!path) { console.error('usage: fy-validate.mjs <fsm.schema.json>'); process.exit(2); }
  const app = JSON.parse(fs.readFileSync(path, 'utf8'));
  const { ok, errors } = validateApp(app);
  if (!ok) { errors.forEach(e => console.error(e)); process.exit(1); }
  console.log('fy-validate: ok');
}
