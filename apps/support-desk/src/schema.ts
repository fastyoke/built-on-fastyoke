import type { ViewerSchema } from '@fastyoke/sdk';

export const TICKET_SCHEMA: ViewerSchema = {
  initial_state: 'New',
  states: ['New', 'Triaged', 'InProgress', 'Waiting', 'Resolved', 'Closed'],
  transitions: [
    { from: 'New', to: 'Triaged', event_type: 'triage' },
    { from: 'Triaged', to: 'InProgress', event_type: 'start' },
    { from: 'InProgress', to: 'Waiting', event_type: 'wait' },
    { from: 'Waiting', to: 'InProgress', event_type: 'resume' },
    { from: 'InProgress', to: 'Resolved', event_type: 'resolve' },
    { from: 'Resolved', to: 'Closed', event_type: 'close' },
  ],
};

// Maps (current state, target state) to the wire event_type for that edge.
export function eventForTarget(from: string, target: string): string | undefined {
  return TICKET_SCHEMA.transitions?.find((t) => t.from === from && t.to === target)?.event_type;
}
