import React, { useState } from 'react';
import { fetchInsights } from '../utils/insights';
import '../styles/insights.css';

export default function InstituteInsights({ institute }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggle = () => {
    if (!open && !data && !loading) {
      loadData();
    }
    setOpen((prev) => !prev);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchInsights(institute);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const avgPkg = data?.avg_package || data?.avgPackage;
  const maxPkg = data?.highest_package || data?.highestPackage;
  const fees = data?.fee_structure || data?.fees;
  const recruiters = data?.top_recruiter || data?.topRecruiters;

  return (
    <div className="insights-container" data-open={open}>
      <button
        type="button"
        className="insights-toggle"
        aria-expanded={open}
        onClick={toggle}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        {open ? 'Hide Insights' : 'Fees & Placements'}
      </button>

      {open && (
        <div className="insights-panel" aria-live="polite">
          {loading && <p className="insights-loading">Fetching analytics...</p>}

          {error && (
            <div className="insights-error">
              <span>{error}</span>
              <button type="button" className="insights-retry-btn" onClick={loadData}>
                Retry
              </button>
            </div>
          )}

          {data && (
            <div className="insights-body">
              <h4 className="insights-title">{data.institute || institute}</h4>
              <dl className="insights-grid">
                {avgPkg && <> <dt>Avg Package:</dt> <dd>{avgPkg}</dd> </>}
                {maxPkg && <> <dt>Highest Package:</dt> <dd>{maxPkg}</dd> </>}
                {fees && <> <dt>Total Fees:</dt> <dd>{fees}</dd> </>}
                {recruiters && <> <dt>Top Recruiters:</dt> <dd>{recruiters}</dd> </>}
              </dl>
            </div>
          )}
        </div>
      )}
    </div>
  );
}