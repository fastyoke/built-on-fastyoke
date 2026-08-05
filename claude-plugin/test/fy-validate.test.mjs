import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateApp } from '../scripts/fy-validate.mjs';

const base = {
  initial_state: 'requested',
  states: ['requested', 'in_review', 'approved', 'denied'],
  transitions: [
    { event: 'submit', from: 'requested', to: 'in_review' },
    { event: 'approve', from: 'in_review', to: 'approved', guard: { '==': [{ var: 'role' }, 'manager'] } },
    { event: 'deny', from: 'in_review', to: 'denied' },
    { event: 'note', from: 'in_review', to: 'in_review', guard: { '<': [{ var: 'notes' }, 5] } },
  ],
};

test('valid app passes', () => {
  const r = validateApp(base);
  assert.equal(r.ok, true, r.errors.join('; '));
});

test('unreachable state fails', () => {
  const app = { ...base, states: [...base.states, 'archived'] };
  const r = validateApp(app);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some(e => e.startsWith('unreachable-state') && e.includes('archived')));
});

test('cancelled state used as target fails', () => {
  const app = {
    ...base,
    states: [...base.states, 'cancelled'],
    transitions: [...base.transitions, { event: 'cancel', from: 'in_review', to: 'cancelled' }],
  };
  const r = validateApp(app);
  assert.ok(r.errors.some(e => e.startsWith('cancelled-state')));
});

test('unbounded self-loop fails', () => {
  const app = {
    ...base,
    transitions: [...base.transitions, { event: 'ping', from: 'approved', to: 'approved' }],
  };
  const r = validateApp(app);
  assert.ok(r.errors.some(e => e.startsWith('unbounded-self-loop') && e.includes('ping')));
});

test('raw string guard fails', () => {
  const app = {
    ...base,
    transitions: base.transitions.map(t => t.event === 'approve' ? { ...t, guard: "role == 'manager'" } : t),
  };
  const r = validateApp(app);
  assert.ok(r.errors.some(e => e.startsWith('raw-guard')));
});

test('unknown transition target fails', () => {
  const app = {
    ...base,
    transitions: [...base.transitions, { event: 'x', from: 'in_review', to: 'nowhere' }],
  };
  const r = validateApp(app);
  assert.ok(r.errors.some(e => e.startsWith('unknown-target') && e.includes('nowhere')));
});
