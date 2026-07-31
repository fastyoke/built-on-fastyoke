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

  if (loading) return <div className="loading">Loading tickets…</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  const rows = data?.records ?? [];
  const priorityClass = (p: string) =>
    p === 'high' ? 'badge badge-danger' : p === 'low' ? 'badge badge-info' : 'badge';

  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">Tickets</h1>
        <p className="page-sub">{rows.length} open · triage, assign, and resolve customer requests.</p>
      </div>

      <form onSubmit={onCreate} className="toolbar">
        <input className="input" aria-label="subject" placeholder="Subject" value={subject}
          onChange={(e) => setSubject(e.target.value)} />
        <input className="input" aria-label="requester email" placeholder="Requester email" value={email}
          onChange={(e) => setEmail(e.target.value)} />
        <button className="btn-primary" type="submit" disabled={creating}>New ticket</button>
      </form>

      {rows.length === 0 ? (
        <div className="empty">No tickets yet. Create one above to get started.</div>
      ) : (
        <table className="data-table">
          <thead><tr><th>Subject</th><th>Requester</th><th>Priority</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><Link to={`/tickets/${r.id}`}>{String(r.data_payload.subject ?? '(no subject)')}</Link></td>
                <td className="muted">{String(r.data_payload.requester_email ?? '')}</td>
                <td><span className={priorityClass(String(r.data_payload.priority ?? 'normal'))}>{String(r.data_payload.priority ?? 'normal')}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
