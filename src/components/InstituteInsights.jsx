import React, { useRef, useState } from 'react';
import { fetchInsights, insightsEnabled } from '../utils/insights';
import '../styles/insights.css';

const memo = new Map(); // reopening a card never calls the server twice in one visit
const inr = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const ROWS = [
  ['Tuition / year', 'tuition_fee_per_year_inr', inr],
  ['Median package', 'median_package_lpa', (v) => `${v} LPA`],
  ['Average package', 'average_package_lpa', (v) => `${v} LPA`],
  ['Highest package', 'highest_package_lpa', (v) => `${v} LPA`],
  ['Placed', 'placement_percent', (v) => `${v}%`],
  ['NIRF (Engineering)', 'nirf_engineering_rank', (v) => `#${v}`],
];

export default function InstituteInsights({ institute }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({ status: 'idle', data: null, error: '' });
  const ctrl = useRef(null);
  if (!insightsEnabled) return null;

  const load = async () => {
    if (memo.has(institute)) return setState({ status: 'done', data: memo.get(institute), error: '' });
    setState({ status: 'loading', data: null, error: '' });
    ctrl.current = new AbortController();
    const timer = setTimeout(() => ctrl.current.abort(), 100000);
    try {
      const data = await fetchInsights(institute, ctrl.current.signal);
      memo.set(institute, data);
      setState({ status: 'done', data, error: '' });
    } catch (e) {
      setState({ status: 'error', data: null, error: e.name === 'AbortError' ? 'This is taking too long. Please try again.' : e.message });
    } finally { clearTimeout(timer); }
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && state.status !== 'loading' && state.status !== 'done') load();
  };

  const { status, data, error } = state;
  const rows = data ? ROWS.filter(([, key]) => data.data?.[key] != null) : [];
  return (
    <div>
      <button type="button" className="insights-toggle" aria-expanded={open} onClick={toggle}>
        {open ? 'Hide insights' : 'Fees & placements'}
      </button>
      {open && (
        <div className="insights-panel" aria-live="polite">
          {status === 'loading' && <p>Reading official sources… the first lookup can take up to a minute.</p>}
          {status === 'error' && (
            <p>{error} <button type="button" className="insights-link" onClick={load}>Retry</button></p>
          )}
          {status === 'done' && (rows.length === 0 ? <p>No reliable figures found for this institute.</p> : (
            <dl className="insights-grid">
              {rows.map(([label, key, fmt]) => (<React.Fragment key={key}><dt>{label}</dt><dd>{fmt(data.data[key])}</dd></React.Fragment>))}
              {data.data?.data_year && (<><dt>Data year</dt><dd>{data.data.data_year}</dd></>)}
            </dl>
          ))}
          {status === 'done' && (
            <p className="insights-note">
              Extracted automatically by TinyFish
              {data.source_url && <> from <a href={data.source_url} target="_blank" rel="noopener noreferrer">{data.source_title || 'the source page'}</a></>}
              {data.fetched_at && <> on {new Date(data.fetched_at).toLocaleDateString('en-IN')}</>}. Verify on the official site before deciding.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
