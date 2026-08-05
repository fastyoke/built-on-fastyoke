---
name: wasm-scripting
description: Use when adding scripting-tier (WASM) custom logic to a FastYoke app.
---

# Scripting-tier (WASM) custom logic

> This is an advanced, optional capability layered on top of a FastYoke app.
> It is **not part of the first-run scaffold** — a new app should start with
> plain JSONLogic guards (see the `authoring-fsm` skill) and only reach for
> scripting-tier logic when a guard or side effect genuinely needs
> compute that JSONLogic cannot express.

Scripting-tier scripts run inside a shared JS engine hosted by a wasmtime
sandbox. The sandbox's invariants are non-negotiable — do not design around
or work around any of them:

- **Fuel and memory caps are enforced.** Every script execution is bounded by
  a fuel budget and a memory ceiling; a script that runs long or allocates
  too much is terminated, not slowed down. Write scripts that do bounded,
  deterministic work — no unbounded loops, no expectation of long-running
  state.
- **No host syscalls.** Scripts cannot read the clock, the filesystem, the
  network, or environment variables directly. Anything that looks like a
  timestamp or an I/O call inside the guest is a shim that returns an inert
  value (e.g. a stubbed clock read returning zero) — never a live host
  capability.
- **I/O only through the provided WIT host imports.** Any interaction with
  the outside world — reading job data, writing a result, emitting an event
  — must go through the declared WIT host import surface for the scripting
  tier. Do not attempt direct I/O, and do not add new host imports without
  extending that declared surface.

## When to reach for this vs. a plain guard

- Guard only needs a boolean over the job's `data_payload` fields (equality,
  comparison, boolean combination) → use a JSONLogic guard, no scripting
  tier needed.
- Guard or side effect needs actual compute — parsing, aggregation across
  multiple fields, a small algorithm — beyond what JSONLogic expresses →
  scripting tier, subject to the sandbox invariants above.

Treat any scripting-tier script as untrusted-until-sandboxed code: the fuel
cap, memory cap, no-syscall rule, and WIT-import-only I/O are the whole
safety story. Do not loosen any of them to make a script "just work."
