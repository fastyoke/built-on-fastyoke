import { FastYokeProvider, ExtensionProvider } from '@fastyoke/sdk';
import { readConfig, buildFetcher } from './fastyoke';
import { BoardPage } from './BoardPage';

export function App() {
  const cfg = readConfig(import.meta.env as Record<string, string | undefined>);
  return (
    <FastYokeProvider tenantId={cfg.tenantId} baseUrl={cfg.apiUrl} fetcher={buildFetcher(cfg.token)}>
      <ExtensionProvider>
        <header style={{ padding: 16, borderBottom: '1px solid #ddd', fontWeight: 600 }}>Issue Board</header>
        <main><BoardPage /></main>
      </ExtensionProvider>
    </FastYokeProvider>
  );
}
