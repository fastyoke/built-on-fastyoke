import { describe, it, expect } from 'vitest';
import { nextActions } from '../workorder';

const T = [
  { from: 'Scheduled', to: 'OnSite', event_type: 'arrive' },
  { from: 'OnSite', to: 'Completed', event_type: 'sign_off', requires_signature: true },
  { from: 'Completed', to: 'Closed', event_type: 'close' },
];

describe('nextActions', () => {
  it('returns outgoing actions for the current state, flagging signature-required edges', () => {
    expect(nextActions(T, 'OnSite')).toEqual([
      { event_type: 'sign_off', to: 'Completed', requiresSignature: true },
    ]);
    expect(nextActions(T, 'Scheduled')).toEqual([
      { event_type: 'arrive', to: 'OnSite', requiresSignature: false },
    ]);
  });
  it('returns [] for a terminal state', () => {
    expect(nextActions(T, 'Closed')).toEqual([]);
  });
});
