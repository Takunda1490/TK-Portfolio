const API_BASE = import.meta.env.VITE_API_BASE || '/api';

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
export const fetchSocialLinks = () =>
  request('/social-links').then((r) => r.social_links);
/**
 * Fetch projects. The API returns only published projects for unauthenticated
 * callers, so this is safe to use on the public projects page.
 */
export const fetchProjects = () => request('/projects').then((r) => r.projects);

export const fetchServices = () => request('/services').then((r) => r.services);

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


