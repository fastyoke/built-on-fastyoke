import { Link } from 'react-router-dom';
import { useEntities } from '@fastyoke/sdk';

export function WorkOrderList() {
  const { data, loading, error } = useEntities('work_order', { pageSize: 100 });
  if (loading) return <div className="loading">Loading work orders…</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  const rows = data?.records ?? [];
  return (
    <div>
      <div className="page-head">
        <h1 className="page-title">Work orders</h1>
        <p className="page-sub">{rows.length} scheduled · dispatch technicians and capture Part 11 sign-off.</p>
      </div>
      {rows.length === 0 ? (
        <div className="empty">No work orders yet.</div>
      ) : (
        <table className="data-table">
          <thead><tr><th>Reference</th><th>Customer</th><th>Technician</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><Link to={`/work-orders/${r.id}`}>{String(r.data_payload.reference ?? '')}</Link></td>
                <td className="muted">{String(r.data_payload.customer ?? '')}</td>
                <td className="muted">{String(r.data_payload.technician ?? '')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
