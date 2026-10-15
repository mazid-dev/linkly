const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function getToken() { return localStorage.getItem('token'); }
export function setToken(token: string) { localStorage.setItem('token', token); }
export function clearToken() { localStorage.removeItem('token'); }

async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  register: (email: string, password: string) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  shorten: (url: string) =>
    request('/shorten', { method: 'POST', body: JSON.stringify({ url }) }),
  getUrls: () => request('/urls'),
  getStats: (id: number) => request(`/urls/${id}/stats`),
};
