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
    <div role="dialog" aria-label="Admin override" style={{ position: 'fixed', inset: 0,
      background: 'rgba(9,30,66,.5)', display: 'grid', placeItems: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 20, width: 380 }}>
        <h2 style={{ marginTop: 0 }}>Admin override</h2>
        <p style={{ color: '#5e6c84', fontSize: 13 }}>
          Force this delivery to any state, bypassing FSM guards. Current: <b>{currentState}</b>.
        </p>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Target state
          <select value={target} onChange={(e) => setTarget(e.target.value)} style={{ display: 'block', width: '100%' }}>
            <option value="">Select…</option>
            {DISPATCH_STATES.filter((s) => s !== currentState).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Reason (required)
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} style={{ display: 'block', width: '100%' }} />
        </label>
        {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={submitting}>Cancel</button>
          <button onClick={() => onSubmit(target, reason)} disabled={!canSubmit}>Force state</button>
        </div>
      </div>
    </div>
  );
}
