import { describe, it, expect, vi } from 'vitest';
import { buildFetcher, readConfig } from '../../fastyoke';

describe('readConfig', () => {
  it('throws a helpful error when env is missing', () => {
    expect(() => readConfig({})).toThrow(/pnpm provision/);
  });
  it('returns config when env is present', () => {
    const c = readConfig({
      VITE_FASTYOKE_API_URL: 'http://localhost:8080',
      VITE_FASTYOKE_TENANT_ID: 't1',
      VITE_FASTYOKE_TOKEN: 'jwt',
    });
    expect(c.tenantId).toBe('t1');
  });
});

describe('buildFetcher', () => {
  it('attaches the bearer token', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}'));
    await buildFetcher('jwt')('http://x/api');
    const init = spy.mock.calls[0][1] as RequestInit;
    expect(new Headers(init.headers).get('authorization')).toBe('Bearer jwt');
    spy.mockRestore();
  });
});
