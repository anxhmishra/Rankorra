import { Link } from 'react-router-dom'
import { useShortlist } from '@/features/shortlist/ShortlistContext'
import { exportCsv } from '@/features/shortlist/exportCsv'
export default function Shortlist() {
  const { items, toggle, move, clear } = useShortlist()
  if (!items.length) return (<section className="wrap pad"><h1>Your choice list is empty</h1>
    <p>Save seats from the predictor and they will show up here in the order you want to fill them.</p>
    <Link to="/predict" className="btn">Go to predictor</Link></section>)
  const count = c => items.filter(x => x.status === c).length
  return (<section className="wrap pad">
    <div className="rhead"><h1>Your choice list</h1>
      <div className="row"><button className="btn" onClick={() => exportCsv(items)}>Download CSV</button>
        <button className="btn btn-ghost" onClick={() => window.print()}>Print</button>
        <button className="btn btn-ghost" onClick={() => confirm('Remove all saved seats?') && clear()}>Clear all</button></div></div>
    <p className="lead">{items.length} seats: {count('Reach')} reach, {count('Target')} target, {count('Safe')} safe.
      {!count('Safe') && ' Add at least one safe seat so you are covered if higher choices don\'t come through.'}</p>
    <p>Order matters in JoSAA: you are allotted the highest-preference seat you qualify for. Put dream seats first and safe seats last.</p>
    <ol className="clist">{items.map((s, i) => (<li key={`${s.institute}${s.branch}${s.quota}`} className="card clrow">
      <span className="pos">{i + 1}</span>
      <div className="grow"><strong>{s.institute}</strong><span>{s.branch} · {s.quota} · closing rank {s.expectedClosingRank.toLocaleString('en-IN')}</span></div>
      <span className={`tag ${s.status.toLowerCase()}`}>{s.status}</span>
      <div className="row">
        <button className="chip" aria-label={`Move ${s.institute} up`} disabled={i === 0} onClick={() => move(i, -1)}>Up</button>
        <button className="chip" aria-label={`Move ${s.institute} down`} disabled={i === items.length - 1} onClick={() => move(i, 1)}>Down</button>
        <button className="chip" aria-label={`Remove ${s.institute}`} onClick={() => toggle(s)}>Remove</button></div>
    </li>))}</ol></section>)
}
