export interface FyConfig { apiUrl: string; tenantId: string; token: string }

export function readConfig(env: Record<string, string | undefined>): FyConfig {
  const apiUrl = env.VITE_FASTYOKE_API_URL;
  const tenantId = env.VITE_FASTYOKE_TENANT_ID;
  const token = env.VITE_FASTYOKE_TOKEN;
  if (!apiUrl || !tenantId || !token) {
    throw new Error('Missing FastYoke env. Run `pnpm provision` at the repo root, then restart Vite.');
  }
  return { apiUrl, tenantId, token };
}

export function buildFetcher(token: string): typeof fetch {
  return (input, init = {}) => {
    const headers = new Headers(init.headers);
    headers.set('authorization', `Bearer ${token}`);
    return fetch(input, { ...init, headers });
  };
}
