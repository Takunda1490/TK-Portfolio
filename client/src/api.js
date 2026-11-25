const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
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

