import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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

  if (!delivery) return <div className="loading">Loading…</div>;
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
    <div>
      <Link to="/" className="crumb">Deliveries</Link>
      <div className="page-head">
        <h1 className="page-title">{String(delivery.data_payload.reference ?? '')}</h1>
        <p className="page-sub">{String(delivery.data_payload.address ?? '')} · driver {String(delivery.data_payload.driver ?? '')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, alignItems: 'start' }}>
        <div className="stack">
          {job && (
            <div className="fsm-panel card card-pad">
              <div className="card-sub">Workflow</div>
              <FsmTimeline
                schema={DISPATCH_SCHEMA}
                entity={{
                  current_state: job.current_state,
                  history: (history ?? []).map((h) => ({
                    from_state: h.from_state, to_state: h.to_state, event_type: h.event_type, timestamp: h.timestamp,
                  })),
                }}
              />
            </div>
          )}
          <div className="card card-pad">
            <div className="card-sub">Actions</div>
            <div className="row" style={{ flexWrap: 'wrap' }}>
              {actions.map((a) => (
                <button key={a.event_type} onClick={() => fire(a.event_type)} disabled={transitioning || overriding}>
                  {a.selfLoop ? `${a.event_type} (self-loop)` : `${a.event_type} → ${a.to}`}
                </button>
              ))}
              <button className="btn-danger" onClick={() => setShowOverride(true)} disabled={transitioning || overriding} style={{ marginLeft: 'auto' }}>
                Override…
              </button>
            </div>
          </div>
        </div>

        <div className="card card-pad">
          <div className="card-title">Driver check-ins</div>
          <div className="card-sub">Self-loop audit trail</div>
          {checkIns.length === 0 ? (
            <p className="muted" style={{ margin: 0 }}>No check-ins yet. Use <code>check_in</code> while En Route.</p>
          ) : (
            <div className="stack" style={{ gap: 0 }}>
              {checkIns.map((h) => (
                <div key={h.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  {h.event_type} — {new Date(h.timestamp).toLocaleString()}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showOverride && job && (
        <OverrideModal currentState={job.current_state} submitting={overriding} error={overrideError}
          onSubmit={override} onClose={() => { setShowOverride(false); setOverrideError(null); }} />
      )}
    </div>
  );
}
