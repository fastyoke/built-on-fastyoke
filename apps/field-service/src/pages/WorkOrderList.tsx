import { Link } from 'react-router-dom';
import { useEntities } from '@fastyoke/sdk';

export function WorkOrderList() {
  const { data, loading, error } = useEntities('work_order', { pageSize: 100 });
  if (loading) return <div>Loading work orders…</div>;
  if (error) return <div style={{ color: 'crimson' }}>Error: {error.message}</div>;

  return (
    <table>
      <thead><tr><th>Reference</th><th>Customer</th><th>Technician</th></tr></thead>
      <tbody>
        {(data?.records ?? []).map((r) => (
          <tr key={r.id}>
            <td><Link to={`/work-orders/${r.id}`}>{String(r.data_payload.reference ?? '')}</Link></td>
            <td>{String(r.data_payload.customer ?? '')}</td>
            <td>{String(r.data_payload.technician ?? '')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
