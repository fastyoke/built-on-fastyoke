// Minimal fetch wrapper for provisioning against a local FastYoke backend.
const API = process.env.FASTYOKE_API_URL ?? 'http://localhost:8080';

export async function api(path, { method = 'GET', token, body, tenantId } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;
  // Tenant-scoped endpoints require tenant_id as a query param (GET) as well
  // as in the body (POST/PUT). Append it to the query whenever we have it.
  let url = `${API}${path}`;
  if (tenantId) url += `${path.includes('?') ? '&' : '?'}tenant_id=${encodeURIComponent(tenantId)}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(tenantId ? { tenant_id: tenantId, ...body } : body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
  if (!res.ok) {
    const err = new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }
  return json;
}

export const API_URL = API;
