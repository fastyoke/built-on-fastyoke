import { useParams } from 'react-router-dom';
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

  if (!ticket) return <div>Loading…</div>;

  return (
    <div>
      <h1>{String(ticket.data_payload.subject ?? '')}</h1>
      <p>{String(ticket.data_payload.body ?? '')}</p>
      {job ? (
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
      ) : (
        <p>No workflow attached.</p>
      )}
      {loading && <p>Transitioning…</p>}
    </div>
  );
}
