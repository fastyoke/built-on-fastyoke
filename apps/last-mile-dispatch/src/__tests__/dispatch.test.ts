import { describe, it, expect } from 'vitest';
import { projectToSvg, nextEvents } from '../dispatch';

describe('projectToSvg', () => {
  it('maps grid coords (0..100) into the svg box with padding', () => {
    const p = projectToSvg(0, 0, { width: 400, height: 300, pad: 20 });
    expect(p).toEqual({ x: 20, y: 20 });
    const q = projectToSvg(100, 100, { width: 400, height: 300, pad: 20 });
    expect(q).toEqual({ x: 380, y: 280 });
  });
  it('clamps out-of-range coords into the box', () => {
    const p = projectToSvg(150, -10, { width: 400, height: 300, pad: 20 });
    expect(p.x).toBe(380);
    expect(p.y).toBe(20);
  });
});

describe('nextEvents', () => {
  const T = [
    { from: 'Assigned', to: 'Assigned', event_type: 'reassign' },
    { from: 'Assigned', to: 'PickedUp', event_type: 'pick_up' },
    { from: 'EnRoute', to: 'EnRoute', event_type: 'check_in' },
    { from: 'EnRoute', to: 'Delivered', event_type: 'deliver' },
  ];
  it('returns the outgoing events for the current state, flagging self-loops', () => {
    expect(nextEvents(T, 'Assigned')).toEqual([
      { event_type: 'reassign', to: 'Assigned', selfLoop: true },
      { event_type: 'pick_up', to: 'PickedUp', selfLoop: false },
    ]);
  });
  it('returns [] for a terminal state', () => {
    expect(nextEvents(T, 'Delivered')).toEqual([]);
  });
});
