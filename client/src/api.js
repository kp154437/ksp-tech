const json = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Request failed');
  }

  return res.json();
};

export const api = {
  signup: (payload) => json('/api/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => json('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  listProjects: () => json('/api/projects'),
  createProject: (name) => json('/api/projects', { method: 'POST', body: JSON.stringify({ name }) }),
  getProject: (id) => json(`/api/projects/${id}`),
  saveProject: (id, payload) => json(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteProject: (id) => json(`/api/projects/${id}`, { method: 'DELETE' }),
  publishProject: (id) => json(`/api/projects/${id}/publish`, { method: 'POST' }),
  exportProject: (id) => json(`/api/projects/${id}/export`)
};
