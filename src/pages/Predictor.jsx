import React, { useState } from 'react';
import {
  loadCutoffsData,
  getPredictions,
  BRANCH_OPTIONS,
} from '../utils/predictionEngine';
import '../styles/animations.css';

export default function Predictor() {
  const [mainsRank, setMainsRank] = useState('');
  const [advancedRank, setAdvancedRank] = useState('');

  const [category, setCategory] = useState('OPEN');
  const [gender, setGender] = useState('Gender-Neutral');
  const [quota, setQuota] = useState('All India (AI)');
  const [preferredBranch, setPreferredBranch] = useState('');

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const [shortlisted, setShortlisted] = useState(() => {
    return JSON.parse(
      localStorage.getItem('shortlist') || '[]'
    );
  });

  const handlePredict = async (e) => {
    e.preventDefault();

    if (!mainsRank) return;

    setLoading(true);

    try {
      const cutoffsData = await loadCutoffsData();

      /*
       * Blank Advanced rank MUST become null.
       *
       * This is important because predictionEngine.js
       * uses null to completely exclude IITs.
       */
      const normalizedAdvancedRank =
        advancedRank.trim() === ''
          ? null
          : parseInt(advancedRank, 10);

      const matches = getPredictions(cutoffsData, {
        mainsRank: parseInt(mainsRank, 10),
        advancedRank: normalizedAdvancedRank,
        category,
        gender,
        quota,
        preferredBranch,
      });

      /*
       * IMPORTANT:
       *
       * DO NOT sort the results here.
       *
       * predictionEngine.js already applies the strict hierarchy:
       *
       * IIT  -> NIT -> IIIT -> GFTI
       *
       * and then sorts within each tier by proximity
       * to the relevant closing rank.
       *
       * Re-sorting here by Safe/Target/Reach would destroy
       * that hierarchy.
       */
      setResults(matches);
    } catch (err) {
      console.error(
        'Failed to load cutoff dataset:',
        err
      );
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShortlist = (item) => {
    const isSaved = shortlisted.some(
      (s) =>
        s.institute === item.institute &&
        s.branch === item.branch
    );

    if (isSaved) return;

    const updated = [...shortlisted, item];

    setShortlisted(updated);

    localStorage.setItem(
      'shortlist',
      JSON.stringify(updated)
    );
  };

  const filteredResults = results
    ? results.filter(
        (item) =>
          activeFilter === 'All' ||
          item.tag?.toLowerCase() ===
            activeFilter.toLowerCase()
      )
    : [];

  return (
    <div
      className="wrap animate-page-entry"
      style={{ padding: '2.5rem 1.5rem' }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '340px 1fr',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        {/* Left Form Sticky Panel */}
        <form
          className="feature-card interactive-card"
          onSubmit={handlePredict}
          style={{
            position: 'sticky',
            top: '90px',
          }}
        >
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '800',
              marginBottom: '1.25rem',
              color: '#fff',
            }}
          >
            Find College Options
          </h2>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {/* JEE Mains Rank */}
            <label
              style={{
                fontSize: '0.85rem',
                fontWeight: '600',
                color: 'var(--text-muted)',
              }}
            >
              JEE Mains Rank

              <input
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 8500"
                value={mainsRank}
                onChange={(e) =>
                  setMainsRank(e.target.value)
                }
                required
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border:
                    '1px solid var(--card-border)',
                  backgroundColor: '#0f1b2c',
                  color: '#fff',
                  fontSize: '0.95rem',
                }}
              />
            </label>

            {/* JEE Advanced Rank */}
            <label
              style={{
                fontSize: '0.85rem',
                fontWeight: '600',
                color: 'var(--text-muted)',
              }}
            >
              JEE Advanced Rank
              <span
                style={{
                  fontWeight: '400',
                  opacity: 0.75,
                  marginLeft: '4px',
                }}
              >
                (Optional)
              </span>

              <input
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 777"
                value={advancedRank}
                onChange={(e) =>
                  setAdvancedRank(e.target.value)
                }
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border:
                    '1px solid var(--card-border)',
                  backgroundColor: '#0f1b2c',
                  color: '#fff',
                  fontSize: '0.95rem',
                }}
              />

              <span
                style={{
                  display: 'block',
                  marginTop: '0.35rem',
                  fontSize: '0.72rem',
                  fontWeight: '400',
                  opacity: 0.7,
                  lineHeight: '1.4',
                }}
              >
                Leave blank if you did not appear for
                JEE Advanced. IITs will be excluded.
              </span>
            </label>

            {/* Category */}
            <label
              style={{
                fontSize: '0.85rem',
                fontWeight: '600',
                color: 'var(--text-muted)',
              }}
            >
              Seat Category

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border:
                    '1px solid var(--card-border)',
                  backgroundColor: '#0f1b2c',
                  color: '#fff',
                  fontSize: '0.95rem',
                }}
              >
                <option value="OPEN">
                  OPEN (General)
                </option>

                <option value="EWS">
                  EWS
                </option>

                <option value="OBC-NCL">
                  OBC-NCL
                </option>

                <option value="SC">
                  SC
                </option>

                <option value="ST">
                  ST
                </option>
              </select>
            </label>

            {/* Gender */}
            <label
              style={{
                fontSize: '0.85rem',
                fontWeight: '600',
                color: 'var(--text-muted)',
              }}
            >
              Gender Pool

              <select
                value={gender}
                onChange={(e) =>
                  setGender(e.target.value)
                }
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border:
                    '1px solid var(--card-border)',
                  backgroundColor: '#0f1b2c',
                  color: '#fff',
                  fontSize: '0.95rem',
                }}
              >
                <option value="Gender-Neutral">
                  Gender-Neutral
                </option>

                <option value="Female-only">
                  Female-Only
                </option>
              </select>
            </label>

            {/* Quota */}
            <label
              style={{
                fontSize: '0.85rem',
                fontWeight: '600',
                color: 'var(--text-muted)',
              }}
            >
              Quota

              <select
                value={quota}
                onChange={(e) =>
                  setQuota(e.target.value)
                }
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border:
                    '1px solid var(--card-border)',
                  backgroundColor: '#0f1b2c',
                  color: '#fff',
                  fontSize: '0.95rem',
                }}
              >
                <option value="All India (AI)">
                  All India (AI)
                </option>

                <option value="Home State (HS)">
                  Home State (HS)
                </option>

                <option value="Other State (OS)">
                  Other State (OS)
                </option>
              </select>
            </label>

            {/* Preferred Branch */}
            <label
              style={{
                fontSize: '0.85rem',
                fontWeight: '600',
                color: 'var(--text-muted)',
              }}
            >
              Preferred Branch

              <select
                value={preferredBranch}
                onChange={(e) =>
                  setPreferredBranch(e.target.value)
                }
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border:
                    '1px solid var(--card-border)',
                  backgroundColor: '#0f1b2c',
                  color: '#fff',
                  fontSize: '0.95rem',
                }}
              >
                {BRANCH_OPTIONS.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-yellow"
              disabled={loading}
              style={{
                width: '100%',
                marginTop: '0.5rem',
              }}
            >
              {loading
                ? 'Analyzing Cutoffs...'
                : 'Predict Colleges'}
            </button>
          </div>
        </form>

        {/* Right Results Panel */}
        <div
          className="feature-card interactive-card"
          style={{
            minHeight: '480px',
            padding: '1.75rem',
          }}
        >
          {!results ? (
            <div
              style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  backgroundColor:
                    'rgba(245, 158, 11, 0.1)',
                  color: 'var(--accent-yellow)',
                  marginBottom: '1.25rem',
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>

              <h3
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '800',
                  color: '#fff',
                  marginBottom: '0.5rem',
                }}
              >
                Your matched colleges will appear here
              </h3>

              <p
                style={{
                  maxWidth: '420px',
                  margin: '0 auto',
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
                }}
              >
                Enter your JEE Mains rank and
                preferences on the left panel to
                calculate your allocation odds.
              </p>
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: '800',
                      color: '#fff',
                    }}
                  >
                    Predicted Colleges (
                    {filteredResults.length})
                  </h2>

                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.2rem',
                    }}
                  >
                    Matching Mains rank #
                    {parseInt(
                      mainsRank,
                      10
                    ).toLocaleString()}
                    {advancedRank && (
                      <>
                        {' '}
                        · Advanced rank #
                        {parseInt(
                          advancedRank,
                          10
                        ).toLocaleString()}
                      </>
                    )}
                    {' '}
                    ({category}, {quota})
                  </p>
                </div>
              </div>

              {/* Filter Pills Bar */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                {[
                  'All',
                  'Safe',
                  'Target',
                  'Reach',
                ].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() =>
                      setActiveFilter(filter)
                    }
                    style={{
                      padding: '0.4rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      border:
                        '1px solid rgba(255, 255, 255, 0.15)',
                      backgroundColor:
                        activeFilter === filter
                          ? '#f59e0b'
                          : 'transparent',
                      color:
                        activeFilter === filter
                          ? '#0d1323'
                          : '#fff',
                      transition:
                        'all 0.2s ease',
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {filteredResults.length === 0 ? (
                <p
                  style={{
                    color: 'var(--text-muted)',
                    padding: '2rem 0',
                  }}
                >
                  No colleges found under the
                  selected "{activeFilter}" filter.
                </p>
              ) : (
                <div
                  style={{
                    overflowX: 'auto',
                  }}
                >
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      textAlign: 'left',
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          borderBottom:
                            '1px solid var(--card-border)',
                        }}
                      >
                        <th
                          style={{
                            padding: '0.75rem 1rem',
                            fontSize: '0.85rem',
                            color:
                              'var(--text-muted)',
                            fontWeight: '600',
                          }}
                        >
                          Institute
                        </th>

                        <th
                          style={{
                            padding: '0.75rem 1rem',
                            fontSize: '0.85rem',
                            color:
                              'var(--text-muted)',
                            fontWeight: '600',
                          }}
                        >
                          Branch
                        </th>

                        <th
                          style={{
                            padding: '0.75rem 1rem',
                            fontSize: '0.85rem',
                            color:
                              'var(--text-muted)',
                            fontWeight: '600',
                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          Closing Rank
                        </th>

                        <th
                          style={{
                            padding: '0.75rem 1rem',
                            fontSize: '0.85rem',
                            color:
                              'var(--text-muted)',
                            fontWeight: '600',
                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          Chance
                        </th>

                        <th
                          style={{
                            padding: '0.75rem 1rem',
                            fontSize: '0.85rem',
                            color:
                              'var(--text-muted)',
                            fontWeight: '600',
                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredResults.map(
                        (item, idx) => {
                          const isSaved =
                            shortlisted.some(
                              (s) =>
                                s.institute ===
                                  item.institute &&
                                s.branch ===
                                  item.branch
                            );

                          return (
                            <tr
                              key={`${item.institute}-${item.branch}-${idx}`}
                              className="animate-table-row"
                              style={{
                                borderBottom:
                                  '1px solid var(--card-border)',
                                animationDelay: `${Math.min(
                                  idx * 0.04,
                                  0.4
                                )}s`,
                              }}
                            >
                              <td
                                style={{
                                  padding: '1rem',
                                  fontWeight: '700',
                                  color: '#fff',
                                }}
                              >
                                {item.institute}
                              </td>

                              <td
                                style={{
                                  padding: '1rem',
                                  color: '#d1d5db',
                                  fontSize: '0.9rem',
                                }}
                              >
                                {item.branch}
                              </td>

                              <td
                                style={{
                                  padding: '1rem',
                                  fontWeight: '700',
                                  color: '#fff',
                                  whiteSpace:
                                    'nowrap',
                                }}
                              >
                                {item.expRank.toLocaleString()}
                              </td>

                              <td
                                style={{
                                  padding: '1rem',
                                  whiteSpace:
                                    'nowrap',
                                }}
                              >
                                <span
                                  className={`sample-card-tag ${item.tag?.toLowerCase()}`}
                                  style={{
                                    display:
                                      'inline-block',
                                    whiteSpace:
                                      'nowrap',
                                    textTransform:
                                      'capitalize',
                                    padding:
                                      '0.3rem 0.75rem',
                                    borderRadius:
                                      '99px',
                                    backgroundColor:
                                      item.tag?.toLowerCase() ===
                                      'safe'
                                        ? 'rgba(52, 211, 153, 0.12)'
                                        : item.tag?.toLowerCase() ===
                                          'target'
                                        ? 'rgba(245, 158, 11, 0.12)'
                                        : 'rgba(248, 113, 113, 0.12)',
                                    border: `1px solid ${
                                      item.tag?.toLowerCase() ===
                                      'safe'
                                        ? 'var(--safe-color)'
                                        : item.tag?.toLowerCase() ===
                                          'target'
                                        ? 'var(--target-color)'
                                        : 'var(--reach-color)'
                                    }`,
                                  }}
                                >
                                  {item.tag}{' '}
                                  {item.prob
                                    ? `(${item.prob})`
                                    : ''}
                                </span>
                              </td>

                              <td
                                style={{
                                  padding: '1rem',
                                  whiteSpace:
                                    'nowrap',
                                }}
                              >
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  style={{
                                    padding:
                                      '0.4rem 0.85rem',
                                    fontSize:
                                      '0.85rem',
                                    whiteSpace:
                                      'nowrap',
                                  }}
                                  disabled={isSaved}
                                  onClick={() =>
                                    handleShortlist(
                                      item
                                    )
                                  }
                                >
                                  {isSaved
                                    ? 'Saved'
                                    : '+ Shortlist'}
                                </button>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}