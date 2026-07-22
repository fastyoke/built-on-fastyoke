export interface Transition { from: string; to: string; event_type: string }

/** Column order comes from block config; falls back to the schema's state list. */
export function columnsFromConfig(
  config: { columns?: unknown },
  schemaStates: string[],
): string[] {
  const cols = config.columns;
  if (Array.isArray(cols) && cols.every((c) => typeof c === 'string')) {
    return cols as string[];
  }
  return schemaStates;
}

/** The event_type for the directed edge from→to, or undefined if no such edge. */
export function eventForEdge(
  transitions: Transition[],
  from: string,
  to: string,
): string | undefined {
  return transitions.find((t) => t.from === from && t.to === to)?.event_type;
}
