import { useState } from 'react'
import { CATEGORIES, GENDERS, QUOTAS, BRANCHES } from './constants'
const init = { rank: '', category: 'OPEN', gender: 'Gender-Neutral', preferred_branch: '', quota: 'AI' }
export default function PredictorForm({ onSubmit, loading }) {
  const [f, setF] = useState(init)
  const [err, setErr] = useState('')
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  function submit(e) {
    e.preventDefault()
    const rank = Number(f.rank)
    if (!Number.isInteger(rank) || rank < 1) return setErr('Enter your rank as a whole number, 1 or higher.')
    if (f.preferred_branch.trim().length < 2) return setErr('Enter or choose a preferred branch.')
    setErr(''); onSubmit({ ...f, rank, preferred_branch: f.preferred_branch.trim() })
  }
  return (<form className="card form" onSubmit={submit}>
    <h2>Your details</h2>
    <label>Rank<input type="number" min="1" inputMode="numeric" value={f.rank} onChange={e => set('rank', e.target.value)} placeholder="e.g. 8500" /></label>
    <label>Category<select value={f.category} onChange={e => set('category', e.target.value)}>{CATEGORIES.map(x => <option key={x}>{x}</option>)}</select></label>
    <label>Gender<select value={f.gender} onChange={e => set('gender', e.target.value)}>{GENDERS.map(x => <option key={x}>{x}</option>)}</select></label>
    <label>Quota<select value={f.quota} onChange={e => set('quota', e.target.value)}>{QUOTAS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
    <label>Preferred branch<input list="branches" value={f.preferred_branch} onChange={e => set('preferred_branch', e.target.value)} placeholder="e.g. Civil Engineering" />
      <datalist id="branches">{BRANCHES.map(b => <option key={b} value={b} />)}</datalist></label>
    {err && <p role="alert" className="err">{err}</p>}
    <button className="btn" disabled={loading}>{loading ? 'Finding seats…' : 'Find my colleges'}</button>
  </form>)
}
