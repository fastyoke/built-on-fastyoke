import { FastYokeProvider, ExtensionProvider } from '@fastyoke/sdk';
import { readConfig, buildFetcher } from './fastyoke';
import { BoardPage } from './BoardPage';

export function App() {
  const cfg = readConfig(import.meta.env as Record<string, string | undefined>);
  return (
    <FastYokeProvider tenantId={cfg.tenantId} baseUrl={cfg.apiUrl} fetcher={buildFetcher(cfg.token)}>
      <ExtensionProvider>
        <div className="app-shell">
          <header className="app-header">
            <span className="app-brand">Issue Board</span>
            <span className="app-tag">built on FastYoke</span>
          </header>
          <main className="app-main">
            <div className="page-head">
              <h1 className="page-title">Board</h1>
              <p className="page-sub">A Kanban board rendered by an authored <code>custom:*</code> extension.</p>
            </div>
            <BoardPage />
          </main>
        </div>
      </ExtensionProvider>
    </FastYokeProvider>
  );
}
