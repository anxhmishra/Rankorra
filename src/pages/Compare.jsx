import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/animations.css';

export default function Compare() {
  const [shortlist, setShortlist] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('shortlist') || '[]');
    setShortlist(saved);
  }, []);

  const updateList = (newList) => {
    setShortlist(newList);
    localStorage.setItem('shortlist', JSON.stringify(newList));
  };

  const handleRemove = (index) => {
    const newList = shortlist.filter((_, i) => i !== index);
    updateList(newList);
  };

  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= shortlist.length) return;

    const newList = [...shortlist];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;
    updateList(newList);
  };

  const exportCSV = () => {
    if (shortlist.length === 0) return;

    let csvContent = 'data:text/csv;charset=utf-8,Preference,Institute,Branch,Closing Rank,Chance\n';
    shortlist.forEach((item, index) => {
      const chanceValue = `${item.tag}${item.prob ? ` (${item.prob})` : ''}`;
      csvContent += `${index + 1},"${item.institute}","${item.branch}",${item.expRank},"${chanceValue}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'SeatWise_Choice_List.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="wrap animate-page-entry" style={{ padding: '3rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.02em' }}>
            Your Choice List
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Organize and reorder your preferred college options before JoSAA preference filling.
          </p>
        </div>

        {shortlist.length > 0 && (
          <button onClick={exportCSV} className="btn btn-yellow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '0.4rem' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export to CSV
          </button>
        )}
      </div>

      {shortlist.length === 0 ? (
        <div className="feature-card interactive-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: 'var(--text-muted)',
            marginBottom: '1.25rem'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' }}>
            Your choice list is empty
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.75rem auto' }}>
            Use the Predictor to find realistic colleges for your rank and add them to your preference shortlist.
          </p>
          <Link to="/predictor" className="btn btn-yellow">
            Go to Predictor →
          </Link>
        </div>
      ) : (
        <div className="feature-card interactive-card" style={{ padding: '1.5rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap' }}>Order</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Institute</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Branch</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap' }}>Closing Rank</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap' }}>Chance</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shortlist.map((item, index) => (
                  <tr
                    key={index}
                    className="animate-table-row"
                    style={{
                      borderBottom: '1px solid var(--card-border)',
                      animationDelay: `${Math.min(index * 0.04, 0.4)}s`
                    }}
                  >
                    <td style={{ padding: '1rem', fontWeight: '800', color: 'var(--accent-yellow)', whiteSpace: 'nowrap' }}>
                      #{index + 1}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '700', color: '#fff' }}>{item.institute}</td>
                    <td style={{ padding: '1rem', color: '#d1d5db', fontSize: '0.9rem' }}>{item.branch}</td>
                    <td style={{ padding: '1rem', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap' }}>{item.expRank.toLocaleString()}</td>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                      <span className={`sample-card-tag ${item.tag}`} style={{
                        display: 'inline-block',
                        whiteSpace: 'nowrap',
                        textTransform: 'capitalize',
                        padding: '0.3rem 0.75rem',
                        borderRadius: '99px',
                        backgroundColor: item.tag === 'safe' ? 'rgba(52, 211, 153, 0.12)' : item.tag === 'target' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(248, 113, 113, 0.12)',
                        border: `1px solid ${item.tag === 'safe' ? 'var(--safe-color)' : item.tag === 'target' ? 'var(--target-color)' : 'var(--reach-color)'}`
                      }}>
                        {item.tag} {item.prob ? `(${item.prob})` : ''}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => handleMove(index, -1)}
                          disabled={index === 0}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                          title="Move Up"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => handleMove(index, 1)}
                          disabled={index === shortlist.length - 1}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                          title="Move Down"
                        >
                          ▼
                        </button>
                        <button
                          onClick={() => handleRemove(index)}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', color: 'var(--reach-color)', borderColor: 'rgba(248, 113, 113, 0.3)' }}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}