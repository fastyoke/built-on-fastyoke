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
      fetcher={buildFetcher(cfg.token)}
    >
      <BrowserRouter>
        <div className="app-shell">
          <header className="app-header">
            <Link to="/" className="app-brand">Support Desk</Link>
            <span className="app-tag">built on FastYoke</span>
          </header>
          <main className="app-main">
            <Routes>
              <Route path="/" element={<TicketList />} />
              <Route path="/tickets/:id" element={<TicketDetail />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </FastYokeProvider>
  );
}
