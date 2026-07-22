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
    <div role="dialog" aria-label="Electronic signature" style={{ position: 'fixed', inset: 0,
      background: 'rgba(9,30,66,.5)', display: 'grid', placeItems: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 20, width: 420 }}>
        <h2 style={{ marginTop: 0 }}>Electronic signature</h2>
        <p style={{ color: '#5e6c84', fontSize: 13 }}>
          Signing off <b>{recordLabel}</b>. This applies a 21 CFR Part 11 signature, sealed and audited by the server.
        </p>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Meaning
          <select value={meaning} onChange={(e) => setMeaning(e.target.value)} style={{ display: 'block', width: '100%' }}>
            {MEANINGS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Password (re-authentication)
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            autoComplete="off" style={{ display: 'block', width: '100%' }} />
        </label>
        <label style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          I understand this electronic signature is legally binding.
        </label>
        {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={submitting}>Cancel</button>
          <button onClick={() => onSubmit({ password, meaning, consent })} disabled={!canSubmit}>Sign & complete</button>
        </div>
      </div>
    </div>
  );
}
