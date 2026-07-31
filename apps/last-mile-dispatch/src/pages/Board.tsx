import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useEntities, useJobs, useFastYoke } from '@fastyoke/sdk';
import { MapPanel, type MapMarker } from '../MapPanel';
import { stateColor } from '../dispatch';

export function Board() {
  const { schemas } = useFastYoke();
  const [schemaId, setSchemaId] = useState<string | undefined>();
  useEffect(() => {
    schemas.list({ entityName: 'delivery' }).then((l) => setSchemaId(l.find((s) => s.is_active)?.id));
  }, [schemas]);
  const { data: deliveries, loading, error } = useEntities('delivery', { pageSize: 100 });
  const { data: jobs } = useJobs(schemaId ? { schemaId } : {});

  if (loading) return <div className="loading">Loading deliveries…</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

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
    <div>
      <div className="page-head">
        <h1 className="page-title">Deliveries</h1>
        <p className="page-sub">{rows.length} active · live map + FSM-driven delivery states.</p>
      </div>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div className="card card-pad" style={{ flex: '0 0 auto' }}>
          <div className="card-sub">Route map</div>
          <MapPanel markers={markers} />
        </div>
        <table className="data-table" style={{ flex: 1, minWidth: 340 }}>
          <thead><tr><th>Reference</th><th>Driver</th><th>State</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><Link to={`/deliveries/${r.id}`}>{r.reference}</Link></td>
                <td className="muted">{r.driver}</td>
                <td><span className="badge" style={{ color: stateColor(r.state) }}>{r.state}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
