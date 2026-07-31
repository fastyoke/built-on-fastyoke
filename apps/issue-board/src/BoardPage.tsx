import { useExtensionRegistry } from '@fastyoke/sdk';

const BLOCK_TYPE = 'custom:kanban_board';
const BOARD_CONFIG = {
  entity_kind: 'issue',
  schema_entity: 'issue',
  columns: ['Backlog', 'Todo', 'Doing', 'Review', 'Done'],
};

export function BoardPage() {
  const { componentsByBlockType, loading } = useExtensionRegistry();
  const Kanban = componentsByBlockType.get(BLOCK_TYPE);

  if (loading) return <div className="loading">Loading the Kanban extension…</div>;
  if (!Kanban) {
    return (
      <div className="empty">
        Kanban extension not installed. Run <code>pnpm provision</code> to upload it, then reload.
      </div>
    );
  }
  return <div className="card card-pad">{<Kanban config={BOARD_CONFIG} />}</div>;
}

// FALLBACK (only if registry loading is blocked at runtime — same component, imported directly):
//   import { KanbanBoard } from '@gallery/kanban-block/src/index';
//   return <KanbanBoard config={BOARD_CONFIG} />;
// The registry path is the intended showcase; the fallback exists so the demo is
// never dark if bundle download / blob-import misbehaves in a given environment.
