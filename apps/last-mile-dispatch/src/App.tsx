import { FastYokeProvider } from '@fastyoke/sdk';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { readConfig, buildFetcher } from './fastyoke';
import { Board } from './pages/Board';
import { DeliveryDetail } from './pages/DeliveryDetail';

export function App() {
  const cfg = readConfig(import.meta.env as Record<string, string | undefined>);
  return (
    <FastYokeProvider tenantId={cfg.tenantId} baseUrl={cfg.apiUrl} fetcher={buildFetcher(cfg.token)}>
      <BrowserRouter>
        <header style={{ padding: 16, borderBottom: '1px solid #ddd' }}>
          <Link to="/" style={{ fontWeight: 600, textDecoration: 'none' }}>Last-Mile Dispatch</Link>
        </header>
        <main style={{ padding: 16 }}>
          <Routes>
            <Route path="/" element={<Board />} />
            <Route path="/deliveries/:id" element={<DeliveryDetail />} />
          </Routes>
        </main>
      </BrowserRouter>
    </FastYokeProvider>
  );
}
