import { Link } from 'react-router-dom';
import { useEntities, useJobs } from '@fastyoke/sdk';
import { MapPanel, type MapMarker } from '../MapPanel';
import { stateColor } from '../dispatch';

export function Board() {
  const { data: deliveries, loading, error } = useEntities('delivery', { pageSize: 100 });
  const { data: jobs } = useJobs({});

  if (loading) return <div>Loading deliveries…</div>;
  if (error) return <div style={{ color: 'crimson' }}>Error: {error.message}</div>;

  const stateByRecord = new Map((jobs ?? []).map((j) => [j.context_record_id, j.current_state]));
  const rows = (deliveries?.records ?? []).map((r) => ({
    id: r.id,
    reference: String(r.data_payload.reference ?? ''),
    driver: String(r.data_payload.driver ?? ''),
    x: Number(r.data_payload.x ?? 0),
    y: Number(r.data_payload.y ?? 0),
    state: stateByRecord.get(r.id) ?? 'Created',
  }));
  const markers: MapMarker[] = rows.map((r) => ({ id: r.id, label: r.reference, x: r.x, y: r.y, state: r.state }));

  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <MapPanel markers={markers} />
      <table>
        <thead><tr><th>Reference</th><th>Driver</th><th>State</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td><Link to={`/deliveries/${r.id}`}>{r.reference}</Link></td>
              <td>{r.driver}</td>
              <td><span style={{ color: stateColor(r.state), fontWeight: 600 }}>{r.state}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
