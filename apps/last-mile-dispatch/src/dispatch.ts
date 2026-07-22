import type { ViewerSchema } from '@fastyoke/sdk';

export interface Transition { from: string; to: string; event_type: string }
export interface SvgBox { width: number; height: number; pad: number }
export interface NextEvent { event_type: string; to: string; selfLoop: boolean }

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Map a 0..100 grid coordinate into the padded SVG box (clamps out-of-range). */
export function projectToSvg(x: number, y: number, box: SvgBox): { x: number; y: number } {
  const gx = clamp(x, 0, 100) / 100;
  const gy = clamp(y, 0, 100) / 100;
  return {
    x: box.pad + gx * (box.width - 2 * box.pad),
    y: box.pad + gy * (box.height - 2 * box.pad),
  };
}

/** Outgoing events from the current state; `selfLoop` flags `from == to` edges.
 *  Accepts a readonly array so `ViewerSchema.transitions` (ReadonlyArray) passes. */
export function nextEvents(transitions: readonly Transition[], currentState: string): NextEvent[] {
  return transitions
    .filter((t) => t.from === currentState)
    .map((t) => ({ event_type: t.event_type, to: t.to, selfLoop: t.to === currentState }));
}

export const DISPATCH_STATES = ['Created', 'Assigned', 'PickedUp', 'EnRoute', 'Delivered'] as const;

const STATE_COLORS: Record<string, string> = {
  Created: '#8993a4', Assigned: '#5243aa', PickedUp: '#0052cc',
  EnRoute: '#ff8b00', Delivered: '#36b37e',
};
export const stateColor = (state: string): string => STATE_COLORS[state] ?? '#8993a4';

export const DISPATCH_SCHEMA: ViewerSchema = {
  initial_state: 'Created',
  states: [...DISPATCH_STATES],
  transitions: [
    { from: 'Created', to: 'Assigned', event_type: 'assign' },
    { from: 'Assigned', to: 'Assigned', event_type: 'reassign' },
    { from: 'Assigned', to: 'PickedUp', event_type: 'pick_up' },
    { from: 'PickedUp', to: 'EnRoute', event_type: 'depart' },
    { from: 'EnRoute', to: 'EnRoute', event_type: 'check_in' },
    { from: 'EnRoute', to: 'Delivered', event_type: 'deliver' },
  ],
};
