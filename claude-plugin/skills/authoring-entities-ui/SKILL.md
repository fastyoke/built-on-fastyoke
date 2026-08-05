---
name: authoring-entities-ui
description: Use when defining a FastYoke entity schema or its schema-driven form UI.
---

# Authoring a FastYoke entity + its UI

FastYoke entity kinds are stored as `entity_kinds.schema_json`, a list of
`{ key, type }` field descriptors. The UI for an entity is **generated from
that schema**, not hand-built:

- **Entity fields drive the UI — never hardcode form fields for a
  user-defined entity.** The form component reads `schema_json` and renders
  one input per field, keyed on `{key, type}`. Adding, renaming, or
  retyping a field in the schema is the only change needed to change the
  form; do not also write a bespoke `<input>` per field in a component.
- **Provide a matching zod schema mirroring the entity for client-side
  validation before any network call.** Every entity used from a form or an
  SDK call needs a zod schema whose shape matches `schema_json` field-for-
  field (same keys, same types mapped to the nearest zod type). Validate
  with it *before* the request goes out, so bad input never reaches the
  network layer.

## Example: entity schema + matching zod pair

Entity schema (`schema_json` on `entity_kinds`):

```json
[
  { "key": "requester", "type": "string" },
  { "key": "start_date", "type": "string" },
  { "key": "end_date", "type": "string" },
  { "key": "reason", "type": "string" },
  { "key": "notes", "type": "number" }
]
```

Matching zod schema (mirrors every key and type above, nothing more, nothing
less):

```ts
import { z } from 'zod';

export const vacationRequestSchema = z.object({
  requester: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  reason: z.string(),
  notes: z.number(),
});

export type VacationRequest = z.infer<typeof vacationRequestSchema>;
```

Use `vacationRequestSchema.parse(formValues)` (or `.safeParse`) before
sending the payload — reject and surface field errors locally rather than
letting the API reject it first.
