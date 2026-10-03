import { mockPredict } from './mock'
const BASE = import.meta.env.VITE_API_URL
/** POST /predict  body: {rank, category, gender, preferred_branch, quota}
 *  returns: {summary:{total,year,safe,target,reach,health}, results:[{institute, branch, quota, finalRound, expectedClosingRank,
 *  bestCaseRank, worstCaseRank, probability, status:'Safe'|'Target'|'Reach', rankMargin, branchMatch}]} */
export async function predict(payload) {
  if (!BASE) return mockPredict(payload)
  const res = await fetch(`${BASE}/predict`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  if (!res.ok) {
    let msg = `Server returned ${res.status}`
    try { const j = await res.json(); msg = typeof j.detail === 'string' ? j.detail : Array.isArray(j.detail) ? j.detail.map(d => d.msg).join(', ') : msg } catch {}
    throw new Error(msg)
  }
  return res.json()
}
