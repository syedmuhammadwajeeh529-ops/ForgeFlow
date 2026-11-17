const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export function getToken() {
  return localStorage.getItem('forgeflow_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('forgeflow_token', token);
  else localStorage.removeItem('forgeflow_token');
}

export async function apiRequest(path, options = {}) {
  const headers = {
    Accept: 'application/json',
    ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path.startsWith('/') ? path : `/${path}`}`, {
    ...options,
    headers,
    body: options.body !== undefined && typeof options.body !== 'string'
      ? JSON.stringify(options.body)
      : options.body,
  });

  const payload = response.status === 204
    ? null
    : await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    const error = new Error(payload?.message || `Request failed (${response.status})`);
    error.status = response.status;
    error.data = payload;
    throw error;
  }

  return payload?.data ?? payload;
}

const entityRoutes = {
  ProjectIdea: '/project-ideas',
  GeneratedIdea: '/generated-ideas',
  SavedProject: '/saved-projects',
  ProjectVersion: '/project-versions',
  FeatureVersion: '/feature-versions',
};

function normalize(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return record;
  const value = { ...record };

  for (const key of ['tech_stack', 'tags']) {
    if (typeof value[key] === 'string') {
      try {
        const parsed = JSON.parse(value[key]);
        value[key] = Array.isArray(parsed) ? parsed : [];
      } catch {
        value[key] = [];
      }
    }
  }

  return value;
}

function rows(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.ideas)) return result.ideas;
  return [];
}

function entity(name) {
  const route = entityRoutes[name];

  return {
    async list(sort = '-created_date', limit = 50) {
      const params = new URLSearchParams({ sort, limit: String(limit) });
      return rows(await apiRequest(`${route}?${params}`)).map(normalize);
    },

    async filter(filters = {}, sort = '-created_date', limit = 50) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
      }
      params.set('sort', sort);
      params.set('limit', String(limit));
      return rows(await apiRequest(`${route}?${params}`)).map(normalize);
    },

    async create(data) {
      return normalize(await apiRequest(route, { method: 'POST', body: data }));
    },

    async bulkCreate(items) {
      if (name === 'GeneratedIdea') {
        return rows(await apiRequest(`${route}/bulk`, {
          method: 'POST',
          body: { ideas: items },
        })).map(normalize);
      }
      return Promise.all(items.map((item) => this.create(item)));
    },

    async update(id, data) {
      return normalize(await apiRequest(`${route}/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: data,
      }));
    },

    async delete(id) {
      return apiRequest(`${route}/${encodeURIComponent(id)}`, { method: 'DELETE' });
    },

    async switch(projectId, versionId) {
      if (name !== 'ProjectVersion') {
        throw new Error('Version switching is only available for project versions.');
      }
      return normalize(await apiRequest(`${route}/${encodeURIComponent(projectId)}/current`, {
        method: 'PATCH',
        body: { version_id: versionId },
      }));
    },
  };
}

export const base44 = {
  entities: Object.fromEntries(
    Object.keys(entityRoutes).map((name) => [name, entity(name)])
  ),
  auth: {
    me: async () => apiRequest('/auth/me'),
    logout: async () => {
      try {
        await apiRequest('/auth/logout', { method: 'POST' });
      } finally {
        setToken(null);
      }
    },
    redirectToLogin(returnUrl = window.location.href) {
      window.location.href = `/login?returnTo=${encodeURIComponent(returnUrl)}`;
    },
  },
  integrations: {
    Core: {
      InvokeLLM: async ({ prompt, response_json_schema, add_context_from_internet = false }) =>
        apiRequest('/ai/generate', {
          method: 'POST',
          body: { prompt, response_json_schema, add_context_from_internet },
        }),
    },
  },
};
