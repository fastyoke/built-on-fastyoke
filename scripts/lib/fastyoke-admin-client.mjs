// Minimal fetch wrapper for provisioning against a local FastYoke backend.
const API = process.env.FASTYOKE_API_URL ?? 'http://localhost:8080';

export async function api(path, { method = 'GET', token, body, tenantId } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(tenantId ? { tenant_id: tenantId, ...body } : body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  }
  return json;
}

export const API_URL = API;
