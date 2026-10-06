export const insightsEnabled = true;

// Uses VITE_BACKEND_URL in production or defaults to local relative path
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';

export async function fetchInsights(instituteName) {
  if (!instituteName) {
    throw new Error('Institute name required');
  }

  const response = await fetch(
    `${API_BASE_URL}/api/insights?institute=${encodeURIComponent(instituteName)}`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to load insights for this institute.');
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned invalid response. Wait!!');
  }

  return await response.json();
}