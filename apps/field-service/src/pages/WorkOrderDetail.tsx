import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FsmTimeline, useEntity, useJobs, useJobHistory, useTransitionJob } from '@fastyoke/sdk';
import { readConfig, buildFetcher } from '../fastyoke';
import { WORKORDER_SCHEMA, nextActions } from '../workorder';
import { SignOffModal, type SignOffInput } from '../SignOffModal';

const cfg = readConfig(import.meta.env as Record<string, string | undefined>);
const signedFetch = buildFetcher(cfg.token);

export function WorkOrderDetail() {
  const { id = '' } = useParams();
  const { data: wo } = useEntity('work_order', id);
  const { data: jobs, refetch: refetchJobs } = useJobs({ entityId: id });
  const job = jobs?.[0]; // one workflow job per work order
  const { data: history, refetch: refetchHistory } = useJobHistory(job?.id ?? '', { realtime: !!job });
  const { transitionJob, loading: transitioning } = useTransitionJob();

  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);
  const [showSign, setShowSign] = useState(false);

  if (!wo) return <div className="loading">Loading…</div>;
  const label = String(wo.data_payload.reference ?? '');
  const actions = job ? nextActions(WORKORDER_SCHEMA.transitions ?? [], job.current_state) : [];

  async function plain(eventType: string) {
    if (!job) return;
    await transitionJob({ id: job.id, input: { eventType } });
    await Promise.all([refetchJobs(), refetchHistory()]);
  }

  // The signature-gated transition: POST the verified signed body directly
  // (the SDK's JobsClient.transition doesn't carry a signature field).
  async function signOff(input: SignOffInput) {
    if (!job) return;
    setSigning(true);
    setSignError(null);
    try {
      const res = await signedFetch(`${cfg.apiUrl}/api/v1/tenant/jobs/${job.id}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: cfg.tenantId, event_type: 'sign_off', signature: input }),
      });
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      setShowSign(false);
      await Promise.all([refetchJobs(), refetchHistory()]);
    } catch (e) {
      setSignError(String(e)); // e.g. 401 on a wrong password — surface it in-modal
    } finally {
      setSigning(false);
    }
  }

  const description = String(wo.data_payload.description ?? '');
  return (
    <div>
      <Link to="/" className="crumb">Work orders</Link>
      <div className="page-head">
        <h1 className="page-title">{label}</h1>
        <p className="page-sub">{String(wo.data_payload.customer ?? '')} · {String(wo.data_payload.site_address ?? '')}</p>
      </div>

      <div className="card card-pad">
        <div className="card-sub">Job details</div>
        <p className="muted" style={{ margin: 0 }}>{description || 'No description provided.'}</p>
      </div>

      {job && (
        <div className="fsm-panel card card-pad">
          <div className="card-sub">Workflow</div>
          <FsmTimeline
            schema={WORKORDER_SCHEMA}
            entity={{
              current_state: job.current_state,
              history: (history ?? []).map((h) => ({
                from_state: h.from_state, to_state: h.to_state, event_type: h.event_type, timestamp: h.timestamp,
                actor: h.actor,
              })),
            }}
          />
        </div>
      )}

      <div className="row" style={{ flexWrap: 'wrap', marginTop: 16 }}>
        {actions.map((a) =>
          a.requiresSignature ? (
            <button key={a.event_type} className="btn-primary" onClick={() => setShowSign(true)} disabled={transitioning || signing}>
              {a.event_type} (sign) → {a.to}
            </button>
          ) : (
            <button key={a.event_type} onClick={() => plain(a.event_type)} disabled={transitioning || signing}>
              {a.event_type} → {a.to}
            </button>
          ),
        )}
      </div>

      {showSign && (
        <SignOffModal recordLabel={label} submitting={signing} error={signError}
          onSubmit={signOff} onClose={() => { setShowSign(false); setSignError(null); }} />
      )}
    </div>
  );
}
