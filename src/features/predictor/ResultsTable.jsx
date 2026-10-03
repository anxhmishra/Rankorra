import { useState } from 'react'
import { CHANCES } from './constants'
import { useShortlist } from '@/features/shortlist/ShortlistContext'
export default function ResultsTable({ status, data, error }) {
  const [show, setShow] = useState(CHANCES)
  const [onlyMatch, setOnlyMatch] = useState(false)
  const { has, toggle: save } = useShortlist()
  if (status === 'idle') return <div className="results empty"><h2>Your matches will appear here</h2><p>Fill in your details and choose a preferred branch.</p></div>
  if (status === 'loading') return <div className="results empty" aria-busy="true"><h2>Finding seats…</h2></div>
  if (status === 'error') return <div className="results empty"><h2>Couldn't get predictions</h2><p>{error}. Check that the API is running and try again.</p></div>
  const { summary: s, results } = data
  const rows = results.filter(r => show.includes(r.status) && (!onlyMatch || r.branchMatch))
  const toggle = c => setShow(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])
  return (<div className="results">
    <div className="rhead"><h2>{rows.length} matches</h2>
      <div className="chips">{CHANCES.map(c => <button key={c} aria-pressed={show.includes(c)} className="chip" onClick={() => toggle(c)}>{c}</button>)}</div></div>
    <p>Based on {s.year} cutoffs: {s.safe} safe, {s.target} target and {s.reach} reach out of {s.total} seats.</p>
    <label className="check"><input type="checkbox" checked={onlyMatch} onChange={e => setOnlyMatch(e.target.checked)} /> Only my preferred branch</label>
    {!rows.length ? <p>No seats match these filters. Show more chance levels or turn off the branch filter.</p> :
    <div className="tscroll"><table><thead><tr><th>Institute</th><th>Branch</th><th>Expected closing rank</th><th>Admission chance</th><th>Status</th><th>Shortlist</th></tr></thead>
      <tbody>{rows.map(r => <tr key={r.institute + r.branch}><td>{r.institute}</td><td>{r.branch}{r.branchMatch && <strong> (your branch)</strong>}</td>
        <td>{r.expectedClosingRank.toLocaleString('en-IN')}</td><td>{r.probability}%</td>
        <td><span className={`tag ${r.status.toLowerCase()}`}>{r.status}</span></td>
        <td><button className="chip" aria-pressed={has(r)} onClick={() => save(r)}>{has(r) ? 'Saved' : 'Save'}</button></td></tr>)}</tbody></table></div>}
  </div>)
}
