const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = body?.message || `HTTP error ${res.status}: ${res.statusText}`;
    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = body;
    throw err;
  }

  return body;
}

export const api = {
  baseUrl: API_BASE_URL,
  request,
  get(endpoint, headers = {}) {
    return request(endpoint, { method: 'GET', headers });
  },
  post(endpoint, body, headers = {}) {
    return request(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers
    });
  },
  // Maintained for backward compatibility, but strictly calls real API and propagates errors
  async fetchWithFallback(endpoint, options = {}) {
    return request(endpoint, options);
  }
};
