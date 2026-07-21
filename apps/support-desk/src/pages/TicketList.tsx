import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEntities, useCreateEntity } from '@fastyoke/sdk';

export function TicketList() {
  const { data, loading, error, refetch } = useEntities('ticket', { page: 1, pageSize: 50 });
  const { createEntity, loading: creating } = useCreateEntity();
  const [subject, setSubject] = useState('');
  const [email, setEmail] = useState('');

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim()) return;
    await createEntity({
      kind: 'ticket',
      dataPayload: { subject, requester_email: email, priority: 'normal', body: '' },
    });
    setSubject(''); setEmail('');
    refetch();
  }

  if (loading) return <div>Loading tickets…</div>;
  if (error) return <div style={{ color: 'crimson' }}>Error: {error.message}</div>;

  return (
    <div>
      <form onSubmit={onCreate} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input aria-label="subject" placeholder="Subject" value={subject}
          onChange={(e) => setSubject(e.target.value)} />
        <input aria-label="requester email" placeholder="Requester email" value={email}
          onChange={(e) => setEmail(e.target.value)} />
        <button type="submit" disabled={creating}>New ticket</button>
      </form>
      <table>
        <thead><tr><th>Subject</th><th>Requester</th><th>Priority</th></tr></thead>
        <tbody>
          {(data?.records ?? []).map((r) => (
            <tr key={r.id}>
              <td><Link to={`/tickets/${r.id}`}>{String(r.data_payload.subject ?? '(no subject)')}</Link></td>
              <td>{String(r.data_payload.requester_email ?? '')}</td>
              <td>{String(r.data_payload.priority ?? '')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
