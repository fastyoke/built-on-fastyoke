import { useState } from 'react';
import { DISPATCH_STATES } from './dispatch';

export interface OverrideModalProps {
  currentState: string;
  submitting: boolean;
  error?: string | null;
  onSubmit: (targetState: string, reason: string) => void;
  onClose: () => void;
}

export function OverrideModal({ currentState, submitting, error, onSubmit, onClose }: OverrideModalProps) {
  const [target, setTarget] = useState('');
  const [reason, setReason] = useState('');
  const canSubmit = target !== '' && reason.trim() !== '' && !submitting;

  return (
    <div role="dialog" aria-label="Admin override" className="modal-scrim">
      <div className="modal">
        <h2>Admin override</h2>
        <p className="modal-sub">
          Force this delivery to any state, bypassing FSM guards. Current: <b>{currentState}</b>.
        </p>
        <label className="field">
          <span className="field-label">Target state</span>
          <select value={target} onChange={(e) => setTarget(e.target.value)}>
            <option value="">Select…</option>
            {DISPATCH_STATES.filter((s) => s !== currentState).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Reason (required)</span>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
        </label>
        {error && <div className="error" style={{ marginTop: 10 }}>{error}</div>}
        <div className="modal-actions">
          <button onClick={onClose} disabled={submitting}>Cancel</button>
          <button className="btn-danger" onClick={() => onSubmit(target, reason)} disabled={!canSubmit}>Force state</button>
        </div>
      </div>
    </div>
  );
}
