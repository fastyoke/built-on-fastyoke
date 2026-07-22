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
        <header style={{ padding: 16, borderBottom: '1px solid #ddd' }}>
          <Link to="/" style={{ fontWeight: 600, textDecoration: 'none' }}>Field Service</Link>
        </header>
        <main style={{ padding: 16 }}>
          <Routes>
            <Route path="/" element={<WorkOrderList />} />
            <Route path="/work-orders/:id" element={<WorkOrderDetail />} />
          </Routes>
        </main>
      </BrowserRouter>
    </FastYokeProvider>
  );
}
