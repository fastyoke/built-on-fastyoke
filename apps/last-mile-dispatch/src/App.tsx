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
        <div className="app-shell">
          <header className="app-header">
            <Link to="/" className="app-brand">Last-Mile Dispatch</Link>
            <span className="app-tag">built on FastYoke</span>
          </header>
          <main className="app-main" style={{ maxWidth: 1080 }}>
            <Routes>
              <Route path="/" element={<Board />} />
              <Route path="/deliveries/:id" element={<DeliveryDetail />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </FastYokeProvider>
  );
}
