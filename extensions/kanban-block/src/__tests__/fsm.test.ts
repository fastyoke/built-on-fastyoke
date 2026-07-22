import { describe, it, expect } from 'vitest';
import { columnsFromConfig, eventForEdge } from '../fsm';

const TRANSITIONS = [
  { from: 'Backlog', to: 'Todo', event_type: 'plan' },
  { from: 'Todo', to: 'Doing', event_type: 'start' },
  { from: 'Doing', to: 'Review', event_type: 'submit' },
  { from: 'Review', to: 'Doing', event_type: 'reject' },
];

describe('columnsFromConfig', () => {
  it('uses config.columns when present', () => {
    expect(columnsFromConfig({ columns: ['A', 'B'] }, ['X'])).toEqual(['A', 'B']);
  });
  it('falls back to schema states when config has none', () => {
    expect(columnsFromConfig({}, ['X', 'Y'])).toEqual(['X', 'Y']);
  });
});

describe('eventForEdge', () => {
  it('finds the event for a legal directed edge', () => {
    expect(eventForEdge(TRANSITIONS, 'Doing', 'Review')).toBe('submit');
    expect(eventForEdge(TRANSITIONS, 'Review', 'Doing')).toBe('reject');
  });
  it('returns undefined for an illegal edge (no self-move, no skip)', () => {
    expect(eventForEdge(TRANSITIONS, 'Backlog', 'Doing')).toBeUndefined();
    expect(eventForEdge(TRANSITIONS, 'Todo', 'Todo')).toBeUndefined();
  });
});
