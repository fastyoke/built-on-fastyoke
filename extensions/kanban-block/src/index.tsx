import { useEffect, useMemo, useState } from 'react';
import { useFastYoke, type ExtensionBlockProps } from '@fastyoke/sdk';
import { columnsFromConfig, eventForEdge, type Transition } from './fsm';

interface Card { issueId: string; jobId: string; title: string; state: string }

export function KanbanBoard({ config }: ExtensionBlockProps) {
  const { entities, jobs, schemas } = useFastYoke();
  const entityKind = String(config.entity_kind ?? 'issue');
  const schemaEntity = String(config.schema_entity ?? entityKind);

  const [cards, setCards] = useState<Card[]>([]);
  const [transitions, setTransitions] = useState<Transition[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      const [issuePage, jobList, schemaList] = await Promise.all([
        entities.list(entityKind, { pageSize: 100 }),
        jobs.list(),
        schemas.list({ entityName: schemaEntity }),
      ]);
      if (!live) return;
      const active = schemaList.find((s) => s.is_active) ?? schemaList[0];
      const sj = (active?.schema_json ?? {}) as {
        states?: Record<string, unknown> | string[];
        transitions?: Transition[];
      };
      const stateNames = Array.isArray(sj.states) ? sj.states : Object.keys(sj.states ?? {});
      setColumns(columnsFromConfig(config, stateNames));
      setTransitions(sj.transitions ?? []);
      const jobByRecord = new Map(jobList.map((j) => [j.context_record_id, j]));
      setCards(
        issuePage.records.map((r) => {
          const job = jobByRecord.get(r.id);
          return {
            issueId: r.id,
            jobId: job?.id ?? '',
            title: String(r.data_payload.title ?? '(untitled)'),
            state: job?.current_state ?? stateNames[0] ?? '',
          };
        }),
      );
    })().catch((e) => live && setError(String(e)));
    return () => { live = false; };
  }, [entities, jobs, schemas, entityKind, schemaEntity, config]);

  const byColumn = useMemo(() => {
    const map: Record<string, Card[]> = {};
    for (const col of columns) map[col] = [];
    for (const c of cards) (map[c.state] ??= []).push(c);
    return map;
  }, [cards, columns]);

  async function onDrop(targetState: string) {
    const issueId = dragging;
    setDragging(null);
    if (!issueId) return;
    const card = cards.find((c) => c.issueId === issueId);
    if (!card || card.state === targetState) return;
    const eventType = eventForEdge(transitions, card.state, targetState);
    if (!eventType || !card.jobId) return; // illegal edge → ignore the drop

    const prev = card.state;
    setCards((cs) => cs.map((c) => (c.issueId === issueId ? { ...c, state: targetState } : c))); // optimistic
    try {
      await jobs.transition(card.jobId, { eventType });
    } catch (e) {
      setCards((cs) => cs.map((c) => (c.issueId === issueId ? { ...c, state: prev } : c))); // revert
      setError(`Transition failed: ${String(e)}`);
    }
  }

  if (error) return <div style={{ color: 'crimson', padding: 12 }}>{error}</div>;

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 12 }}>
      {columns.map((col) => (
        <div
          key={col}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDrop(col)}
          style={{ flex: 1, minWidth: 180, background: '#f4f5f7', borderRadius: 8, padding: 8 }}
        >
          <h3 style={{ fontSize: 13, textTransform: 'uppercase', color: '#5e6c84' }}>
            {col} <span>({byColumn[col]?.length ?? 0})</span>
          </h3>
          {(byColumn[col] ?? []).map((c) => (
            <div
              key={c.issueId}
              draggable
              onDragStart={() => setDragging(c.issueId)}
              data-testid="issue-card"
              style={{ background: '#fff', borderRadius: 6, boxShadow: '0 1px 0 rgba(9,30,66,.25)',
                padding: 8, marginBottom: 8, cursor: 'grab' }}
            >
              {c.title}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default KanbanBoard;
