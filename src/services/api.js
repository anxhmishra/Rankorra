import { mockPredict } from './mock'
const BASE = import.meta.env.VITE_API_URL

/** 
 * POST /api/optimize-choices 
 * body: { mains_rank, advanced_rank, category, quota, gender, preferred_branch }
 */
export async function predict(payload) {
  if (!BASE) return mockPredict(payload)

  // Ensure payload maps correctly to your new FastAPI StudentProfile schema
  const formattedPayload = {
    mains_rank: Number(payload.mains_rank || payload.rank), // Fallback if old components pass 'rank'
    advanced_rank: payload.advanced_rank ? Number(payload.advanced_rank) : null,
    category: payload.category,
    quota: payload.quota || "AI",
    gender: payload.gender,
    preferred_branch: payload.preferred_branch || "All Branches (Any Discipline)"
  }

  const res = await fetch(`${BASE}/api/optimize-choices`, { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(formattedPayload) 
  })

  if (!res.ok) {
    let msg = `Server returned ${res.status}`
    try { 
      const j = await res.json()
      msg = typeof j.detail === 'string' ? j.detail : Array.isArray(j.detail) ? j.detail.map(d => d.msg).join(', ') : msg 
    } catch {}
    throw new Error(msg)
  }
  
  return res.json()
}