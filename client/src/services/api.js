import { mockApi } from '../mock/mockApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

async function fetchWithFallback(endpoint, options = {}, fallbackFn) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s timeout before falling back

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    // Graceful fallback to mock service during frontend development / backend startup
    // console.warn(`Backend API ${endpoint} unreachable or error. Using mock service fallback.`, error.message);
    return await fallbackFn();
  }
}

export const api = {
  fetchWithFallback
};
