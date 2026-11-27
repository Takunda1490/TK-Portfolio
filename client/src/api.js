const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const err = new Error(`API error: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

/** Normalize tech_stack which may arrive as a JSON string or an array. */
export function normalizeTechStack(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Apply an ImageKit URL transformation to a cover image.
 * If the URL is already an ImageKit URL, inject /tr:{transforms}/ after the host.
 * Otherwise return the URL unchanged.
 */
export function imageKitUrl(url, transforms) {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (u.hostname.endsWith('imagekit.io') || u.hostname.includes('imagekit')) {
      const pathname = u.pathname.replace(/^\/+/, '');
      return `${u.origin}/tr:${transforms}/${pathname}`;
    }
  } catch {
    // not a valid URL; return as-is
  }
  return url;
}

export const fetchProfile = () => request('/profile').then((r) => r.profile);
export const fetchSkills = () => request('/skills').then((r) => r.skills);
/**
 * Fetch projects. The API returns only published projects for unauthenticated
 * callers, so this is safe to use on the public projects page.
 */
export const fetchProjects = () => request('/projects').then((r) => r.projects);

export const createProject = (payload) =>
  request('/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  }).then((r) => r.project);

export const updateProject = (id, payload) =>
  request(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }).then((r) => r.project);

export const deleteProject = (id) =>
  request(`/projects/${id}`, { method: 'DELETE' }).then(() => id);

export const reorderProjects = (ids) =>
  request('/projects/reorder', {
    method: 'PATCH',
    body: JSON.stringify({ ids }),
  });

export const fetchServices = () => request('/services').then((r) => r.services);

export const createService = (payload) =>
  request('/services', {
    method: 'POST',
    body: JSON.stringify(payload),
  }).then((r) => r.service);

export const updateService = (id, payload) =>
  request(`/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }).then((r) => r.service);

export const deleteService = (id) =>
  request(`/services/${id}`, { method: 'DELETE' }).then(() => id);

export const reorderServices = (ids) =>
  request('/services/reorder', {
    method: 'PATCH',
    body: JSON.stringify({ ids }),
  });

export const createSkill = (payload) =>
  request('/skills', {
    method: 'POST',
    body: JSON.stringify(payload),
  }).then((r) => r.skill);

export const updateSkill = (id, payload) =>
  request(`/skills/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }).then((r) => r.skill);

export const deleteSkill = (id) =>
  request(`/skills/${id}`, { method: 'DELETE' }).then(() => id);

export const fetchSocialLinks = () =>
  request('/social-links').then((r) => r.social_links);

export const createSocialLink = (payload) =>
  request('/social-links', {
    method: 'POST',
    body: JSON.stringify(payload),
  }).then((r) => r.social_link);

export const updateSocialLink = (id, payload) =>
  request(`/social-links/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }).then((r) => r.social_link);

export const deleteSocialLink = (id) =>
  request(`/social-links/${id}`, { method: 'DELETE' }).then(() => id);

export const fetchMessages = (params) => {
  const qs = new URLSearchParams(params || {}).toString();
  return request(`/messages${qs ? '?' + qs : ''}`).then((r) => r);
};

export const markMessageRead = (id) =>
  request(`/messages/${id}/read`, { method: 'PATCH' }).then((r) => r.message);

export const markMessageUnread = (id) =>
  request(`/messages/${id}/unread`, { method: 'PATCH' }).then((r) => r.message);

export const deleteMessage = (id) =>
  request(`/messages/${id}`, { method: 'DELETE' }).then(() => id);

export const submitContact = (payload) =>
  request('/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  }).then((r) => r.message);

export const fetchMe = async () => {
  try {
    const r = await request('/auth/me');
    return r.user;
  } catch (err) {
    if (err.status === 401) return null;
    throw err;
  }
};

export const login = (email, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }).then((r) => r.user);

export const updateProfile = (payload) =>
  request('/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  }).then((r) => r.profile);

export const fetchSettings = () => request('/settings').then((r) => r.settings);

export const updateSettings = (settings) =>
  request('/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  }).then((r) => r.settings);

/**
 * Upload a file to ImageKit via the REST upload endpoint.
 * Requires VITE_IMAGEKIT_PUBLIC_KEY and VITE_IMAGEKIT_PRIVATE_KEY to be exposed
 * to the client (set them in client/.env as VITE_* variables). Falls back
 * gracefully so the form can still accept an ImageKit URL directly.
 */
export const uploadToImageKit = async (file) => {
  const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;
  const privateKey = import.meta.env.VITE_IMAGEKIT_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    throw new Error('ImageKit credentials not configured for client uploads');
  }
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', file.name);
  formData.append('useUniqueFileName', 'true');
  const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${publicKey}:${privateKey}`)}`,
    },
    body: formData,
  });
  if (!res.ok) throw new Error(`ImageKit upload failed: ${res.status}`);
  const data = await res.json();
  return data.url;
};


