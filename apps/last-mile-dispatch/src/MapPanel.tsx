import { useNavigate } from 'react-router-dom';
import { projectToSvg, stateColor, type SvgBox } from './dispatch';

export interface MapMarker { id: string; label: string; x: number; y: number; state: string }

const BOX: SvgBox = { width: 520, height: 340, pad: 24 };

export function MapPanel({ markers }: { markers: MapMarker[] }) {
  const navigate = useNavigate();
  return (
    <svg width={BOX.width} height={BOX.height} role="img" aria-label="Delivery map"
      style={{ background: '#f4f5f7', borderRadius: 8 }}>
      {[0.25, 0.5, 0.75].flatMap((f) => [
        <line key={`h${f}`} x1={BOX.pad} x2={BOX.width - BOX.pad} y1={BOX.pad + f * (BOX.height - 2 * BOX.pad)}
          y2={BOX.pad + f * (BOX.height - 2 * BOX.pad)} stroke="#dfe1e6" />,
        <line key={`v${f}`} y1={BOX.pad} y2={BOX.height - BOX.pad} x1={BOX.pad + f * (BOX.width - 2 * BOX.pad)}
          x2={BOX.pad + f * (BOX.width - 2 * BOX.pad)} stroke="#dfe1e6" />,
      ])}
      {markers.map((m) => {
        const p = projectToSvg(m.x, m.y, BOX);
        return (
          <g key={m.id} transform={`translate(${p.x},${p.y})`} style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/deliveries/${m.id}`)} data-testid="map-marker">
            <circle r={9} fill={stateColor(m.state)} stroke="#fff" strokeWidth={2} />
            <text x={12} y={4} fontSize={11} fill="#172b4d">{m.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
