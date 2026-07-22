import type { ViewerSchema } from '@fastyoke/sdk';

export interface Transition { from: string; to: string; event_type: string; requires_signature?: boolean }
export interface WorkOrderAction { event_type: string; to: string; requiresSignature: boolean }

/** Outgoing actions from the current state; `requiresSignature` flags Part 11 edges.
 *  Readonly param so `ViewerSchema.transitions` (ReadonlyArray) passes. */
export function nextActions(transitions: readonly Transition[], currentState: string): WorkOrderAction[] {
  return transitions
    .filter((t) => t.from === currentState)
    .map((t) => ({ event_type: t.event_type, to: t.to, requiresSignature: !!t.requires_signature }));
}

// Typed as the local `Transition` (which carries `requires_signature`) so the
// runtime flag survives; the SDK's `ViewerTransition` omits it, so the array is
// declared separately to avoid the object-literal excess-property check while
// staying structurally assignable to `ViewerSchema.transitions`.
const WORKORDER_TRANSITIONS: Transition[] = [
  { from: 'Requested', to: 'Scheduled', event_type: 'schedule' },
  { from: 'Scheduled', to: 'OnSite', event_type: 'arrive' },
  { from: 'OnSite', to: 'Completed', event_type: 'sign_off', requires_signature: true },
  { from: 'Completed', to: 'Closed', event_type: 'close' },
];

export const WORKORDER_SCHEMA: ViewerSchema = {
  initial_state: 'Requested',
  states: ['Requested', 'Scheduled', 'OnSite', 'Completed', 'Closed'],
  transitions: WORKORDER_TRANSITIONS,
};
