import { useState } from 'react';

export interface SignOffInput { password: string; meaning: string; consent: boolean }

export interface SignOffModalProps {
  recordLabel: string;
  submitting: boolean;
  error?: string | null;
  onSubmit: (input: SignOffInput) => void;
  onClose: () => void;
}

const MEANINGS = ['Work completed and verified', 'Customer accepted', 'Supervisor approved'];

export function SignOffModal({ recordLabel, submitting, error, onSubmit, onClose }: SignOffModalProps) {
  const [password, setPassword] = useState('');
  const [meaning, setMeaning] = useState(MEANINGS[0]);
  const [consent, setConsent] = useState(false);
  const canSubmit = password !== '' && meaning.trim() !== '' && consent && !submitting;

  return (
    <div role="dialog" aria-label="Electronic signature" className="modal-scrim">
      <div className="modal">
        <h2>Electronic signature</h2>
        <p className="modal-sub">
          Signing off <b>{recordLabel}</b>. This applies a 21 CFR Part 11 signature, sealed and audited by the server.
        </p>
        <label className="field">
          <span className="field-label">Meaning</span>
          <select value={meaning} onChange={(e) => setMeaning(e.target.value)}>
            {MEANINGS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Password (re-authentication)</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="off" />
        </label>
        <label className="row" style={{ gap: 8, marginBottom: 4, cursor: 'pointer' }}>
          <input type="checkbox" style={{ width: 'auto' }} checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>I understand this electronic signature is legally binding.</span>
        </label>
        {error && <div className="error" style={{ marginTop: 10 }}>{error}</div>}
        <div className="modal-actions">
          <button onClick={onClose} disabled={submitting}>Cancel</button>
          <button className="btn-primary" onClick={() => onSubmit({ password, meaning, consent })} disabled={!canSubmit}>Sign & complete</button>
        </div>
      </div>
    </div>
  );
}
