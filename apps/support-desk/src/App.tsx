import { FastYokeProvider } from '@fastyoke/sdk';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { readConfig, buildFetcher } from './fastyoke';
import { TicketList } from './pages/TicketList';
import { TicketDetail } from './pages/TicketDetail';

export function App() {
  const cfg = readConfig(import.meta.env as Record<string, string | undefined>);
  return (
    <FastYokeProvider
      tenantId={cfg.tenantId}
      baseUrl={cfg.apiUrl}
      token={cfg.token}
      fetcher={buildFetcher(cfg.token)}
    >
      <BrowserRouter>
        <header style={{ padding: 16, borderBottom: '1px solid #ddd' }}>
          <Link to="/" style={{ fontWeight: 600, textDecoration: 'none' }}>Support Desk</Link>
        </header>
        <main style={{ padding: 16 }}>
          <Routes>
            <Route path="/" element={<TicketList />} />
            <Route path="/tickets/:id" element={<TicketDetail />} />
          </Routes>
        </main>
      </BrowserRouter>
    </FastYokeProvider>
  );
}
