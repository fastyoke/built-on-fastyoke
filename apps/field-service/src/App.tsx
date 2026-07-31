import { FastYokeProvider } from '@fastyoke/sdk';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { readConfig, buildFetcher } from './fastyoke';
import { WorkOrderList } from './pages/WorkOrderList';
import { WorkOrderDetail } from './pages/WorkOrderDetail';

export function App() {
  const cfg = readConfig(import.meta.env as Record<string, string | undefined>);
  return (
    <FastYokeProvider tenantId={cfg.tenantId} baseUrl={cfg.apiUrl} fetcher={buildFetcher(cfg.token)}>
      <BrowserRouter>
        <div className="app-shell">
          <header className="app-header">
            <Link to="/" className="app-brand">Field Service</Link>
            <span className="app-tag">built on FastYoke</span>
          </header>
          <main className="app-main">
            <Routes>
              <Route path="/" element={<WorkOrderList />} />
              <Route path="/work-orders/:id" element={<WorkOrderDetail />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </FastYokeProvider>
  );
}
