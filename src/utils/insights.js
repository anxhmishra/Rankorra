export const insightsEnabled = true;

export async function fetchInsights(instituteName) {
  if (!instituteName) {
    throw new Error('Institute name is required');
  }

  const response = await fetch(`/api/insights?institute=${encodeURIComponent(instituteName)}`);
  const contentType = response.headers.get('content-type') || '';

  // Handle non-JSON server responses (e.g., 404 or Render cold starts)
  if (!contentType.includes('application/json')) {
    if (response.status === 404) {
      throw new Error('API route not found. Ensure FastAPI endpoint is /api/insights');
    }
    throw new Error('Backend server is waking up or unreachable. Please try again.');
  }

  const data = await response.json();

  if (!response.ok) {
    // FastAPI outputs error messages in the "detail" key
    throw new Error(data.detail || data.error || 'Failed to fetch insights.');
  }

  return data;
}