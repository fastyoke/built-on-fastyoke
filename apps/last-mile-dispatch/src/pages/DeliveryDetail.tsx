import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  FsmTimeline, useEntity, useJobs, useJobHistory, useTransitionJob, useCancelJob,
} from '@fastyoke/sdk';
import { DISPATCH_SCHEMA, nextEvents } from '../dispatch';
import { OverrideModal } from '../OverrideModal';

export function DeliveryDetail() {
  const { id = '' } = useParams();
  const { data: delivery } = useEntity('delivery', id);
  const { data: jobs, refetch: refetchJobs } = useJobs({ entityId: id });
  // one workflow job per delivery in this app; take the first
  const job = jobs?.[0];
  const { data: history, refetch: refetchHistory } = useJobHistory(job?.id ?? '', { realtime: !!job });
  const { transitionJob, loading: transitioning } = useTransitionJob();
  const { cancelJob, loading: overriding } = useCancelJob();

  const [showOverride, setShowOverride] = useState(false);
  const [overrideError, setOverrideError] = useState<string | null>(null);

  if (!delivery) return <div>Loading…</div>;
  const actions = job ? nextEvents(DISPATCH_SCHEMA.transitions ?? [], job.current_state) : [];

  async function fire(eventType: string) {
    if (!job) return;
    await transitionJob({ id: job.id, input: { eventType } });
    await Promise.all([refetchJobs(), refetchHistory()]);
  }

  async function override(targetState: string, reason: string) {
    if (!job) return;
    setOverrideError(null);
    try {
      await cancelJob({ id: job.id, input: { targetState, reason } });
      setShowOverride(false);
      await Promise.all([refetchJobs(), refetchHistory()]);
    } catch (e) {
      // Non-admin JWTs get 403 here; surface it in-modal rather than failing silently.
      setOverrideError(String(e));
    }
  }

  const checkIns = (history ?? []).filter((h) => h.event_type === 'check_in');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div>
        <h1>{String(delivery.data_payload.reference ?? '')}</h1>
        <p>{String(delivery.data_payload.address ?? '')} · driver {String(delivery.data_payload.driver ?? '')}</p>
        {job && (
          <FsmTimeline
            schema={DISPATCH_SCHEMA}
            entity={{
              current_state: job.current_state,
              history: (history ?? []).map((h) => ({
                from_state: h.from_state, to_state: h.to_state, event_type: h.event_type, timestamp: h.timestamp,
              })),
            }}
          />
        )}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          {actions.map((a) => (
            <button key={a.event_type} onClick={() => fire(a.event_type)} disabled={transitioning || overriding}>
              {a.selfLoop ? `${a.event_type} (self-loop)` : `${a.event_type} → ${a.to}`}
            </button>
          ))}
          <button onClick={() => setShowOverride(true)} disabled={transitioning || overriding} style={{ marginLeft: 'auto', color: '#bf2600' }}>
            Override…
          </button>
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: 15 }}>Driver check-ins (self-loop audit trail)</h2>
        {checkIns.length === 0 && <p style={{ color: '#5e6c84' }}>No check-ins yet. Use <code>check_in</code> while En Route.</p>}
        <ul>
          {checkIns.map((h) => (
            <li key={h.id}>{h.event_type} — {new Date(h.timestamp).toLocaleString()}</li>
          ))}
        </ul>
      </div>

      {showOverride && job && (
        <OverrideModal currentState={job.current_state} submitting={overriding} error={overrideError}
          onSubmit={override} onClose={() => { setShowOverride(false); setOverrideError(null); }} />
      )}
    </div>
  );
}
