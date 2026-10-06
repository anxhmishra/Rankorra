const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const insightsEnabled = Boolean(BASE); // the feature needs the backend, so it hides itself without one

export async function fetchInsights(institute, signal) {
  const res = await fetch(`${BASE}/api/college-insights?institute=${encodeURIComponent(institute)}`, { signal });
  if (!res.ok) {
    let msg = 'Could not load insights right now.';
    try { const j = await res.json(); if (typeof j.detail === 'string') msg = j.detail; } catch { /* keep default */ }
    throw new Error(msg);
  }
  return res.json();
}
