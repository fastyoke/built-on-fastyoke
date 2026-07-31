import { Link, useParams } from 'react-router-dom';
import { FsmTimeline, useEntity, useJobs, useJobHistory, useTransitionJob } from '@fastyoke/sdk';
import { TICKET_SCHEMA, eventForTarget } from '../schema';

export function TicketDetail() {
  const { id = '' } = useParams();
  const { data: ticket } = useEntity('ticket', id);
  const { data: jobs, refetch: refetchJobs } = useJobs({ entityId: id });
  const job = jobs?.[0];
  const { data: history } = useJobHistory(job?.id ?? '', { realtime: !!job });
  const { transitionJob, loading } = useTransitionJob();

  async function onTransition(targetState: string) {
    if (!job) return;
    const eventType = eventForTarget(job.current_state, targetState);
    if (!eventType) return;
    await transitionJob({ id: job.id, input: { eventType } });
    refetchJobs();
  }

  if (!ticket) return <div className="loading">Loading…</div>;

  const body = String(ticket.data_payload.body ?? '');
  return (
    <div>
      <Link to="/" className="crumb">Tickets</Link>
      <div className="page-head">
        <h1 className="page-title">{String(ticket.data_payload.subject ?? '')}</h1>
        <p className="page-sub">{String(ticket.data_payload.requester_email ?? '')}</p>
      </div>
      <div className="card card-pad">
        <div className="card-sub">Description</div>
        <p className="muted" style={{ margin: 0 }}>{body || 'No description provided.'}</p>
      </div>
      {job ? (
        <div className="fsm-panel card card-pad">
          <div className="card-sub">Workflow</div>
          <FsmTimeline
            schema={TICKET_SCHEMA}
            entity={{
              current_state: job.current_state,
              history: (history ?? []).map((h) => ({
                from_state: h.from_state, to_state: h.to_state,
                event_type: h.event_type, timestamp: h.timestamp,
              })),
            }}
            onTransitionRequest={onTransition}
          />
        </div>
      ) : (
        <p className="muted">No workflow attached.</p>
      )}
      {loading && <p className="loading">Transitioning…</p>}
    </div>
  );
}
