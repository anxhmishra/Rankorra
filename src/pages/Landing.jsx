import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/animations.css';

export default function Landing() {
  return (
    <div className="animate-page-entry" style={{ width: '100%', overflowX: 'hidden' }}>
      
      {/* ---------------- 1. HERO SECTION ---------------- */}
      <section style={{ padding: '4.5rem 1.5rem 5rem 1.5rem', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="wrap" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3.5rem',
            alignItems: 'center'
          }}>
            
            {/* Left Column: Hero Text & CTAs */}
            <div className="animate-fade-in-up" style={{ maxWidth: '620px' }}>
              <h1 style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
                fontWeight: '800',
                lineHeight: '1.1',
                color: '#ffffff',
                letterSpacing: '-0.03em',
                marginBottom: '1.5rem'
              }}>
                Know where your rank can take you, before choice filling begins.
              </h1>

              <p style={{
                fontSize: '1.15rem',
                lineHeight: '1.6',
                color: '#94a3b8',
                marginBottom: '2.25rem',
                fontWeight: '400'
              }}>
                SeatWise predicts which IITs, NITs, IIITs and GFTIs you can realistically get, using your JEE rank and past JoSAA cutoffs.
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link
                  to="/predictor"
                  className="btn btn-yellow"
                  style={{
                    padding: '0.85rem 1.75rem',
                    fontSize: '1.05rem',
                    fontWeight: '700',
                    borderRadius: '10px',
                    transition: 'all 0.25s ease'
                  }}
                >
                  Find my colleges
                </Link>

                <a
                  href="#how-it-works"
                  className="btn btn-secondary"
                  style={{
                    padding: '0.85rem 1.75rem',
                    fontSize: '1.05rem',
                    fontWeight: '600',
                    borderRadius: '10px',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    transition: 'all 0.25s ease'
                  }}
                >
                  How it works
                </a>
              </div>
            </div>

            {/* Right Column: Animated Ladder Cards */}
            <div className="animate-ladder-float" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Card 1: Reach */}
              <div className="ladder-card reach">
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                    NIT Trichy
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
                    Computer Science
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', display: 'block' }}>
                    1,420
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#f87171' }}>
                    Reach
                  </span>
                </div>
              </div>

              {/* Card 2: Target */}
              <div className="ladder-card target">
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                    NIT Warangal
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
                    Electronics & Comm.
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', display: 'block' }}>
                    3,980
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#f59e0b' }}>
                    Target
                  </span>
                </div>
              </div>

              {/* Card 3: Safe */}
              <div className="ladder-card safe">
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                    IIIT Allahabad
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
                    Information Technology
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', display: 'block' }}>
                    6,210
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#34d399' }}>
                    Safe
                  </span>
                </div>
              </div>


            </div>

          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', width: '100%' }} />

      {/* ---------------- 2. WHY STUDENTS USE IT ---------------- */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div className="wrap" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          
          <h2 style={{
            fontSize: '2.2rem',
            fontWeight: '800',
            color: '#ffffff',
            letterSpacing: '-0.02em',
            marginBottom: '2.5rem'
          }}>
            Why students use it
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            
            {/* Feature Card 1 */}
            <div className="feature-card interactive-card" style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1.75rem',
              transition: 'all 0.35s ease'
            }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.75rem' }}>
                Trained on past cutoffs
              </h3>
              <p style={{ fontSize: '0.925rem', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>
                Our model learns from previous JoSAA rounds, so results follow real closing ranks.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="feature-card interactive-card" style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1.75rem',
              transition: 'all 0.35s ease'
            }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.75rem' }}>
                Made for your profile
              </h3>
              <p style={{ fontSize: '0.925rem', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>
                Rank, category, gender and home state all change which seats you can get. We account for every one.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="feature-card interactive-card" style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1.75rem',
              transition: 'all 0.35s ease'
            }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.75rem' }}>
                Safe, target or reach
              </h3>
              <p style={{ fontSize: '0.925rem', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>
                Every option is tagged, so you can build a choice list with a sensible spread.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="feature-card interactive-card" style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1.75rem',
              transition: 'all 0.35s ease'
            }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.75rem' }}>
                Branch-first search
              </h3>
              <p style={{ fontSize: '0.925rem', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>
                Pick the branches you care about and see only those, across all institutes.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', width: '100%' }} />

      {/* ---------------- 3. HOW IT WORKS ---------------- */}
      <section id="how-it-works" style={{ padding: '5rem 1.5rem' }}>
        <div className="wrap" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          
          <h2 style={{
            fontSize: '2.2rem',
            fontWeight: '800',
            color: '#ffffff',
            letterSpacing: '-0.02em',
            marginBottom: '3rem'
          }}>
            How it works
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2.5rem'
          }}>
            
            {/* Step 1 */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#f59e0b',
                color: '#0d1323',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '1.1rem',
                flexShrink: 0,
                marginTop: '0.2rem'
              }}>
                1
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.5rem' }}>
                  Enter your details
                </h3>
                <p style={{ fontSize: '0.925rem', color: '#94a3b8', lineHeight: '1.5', margin: 0 }}>
                  Rank, category, gender and home state.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#f59e0b',
                color: '#0d1323',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '1.1rem',
                flexShrink: 0,
                marginTop: '0.2rem'
              }}>
                2
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.5rem' }}>
                  Choose branches
                </h3>
                <p style={{ fontSize: '0.925rem', color: '#94a3b8', lineHeight: '1.5', margin: 0 }}>
                  Select one or more you would like to study.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#f59e0b',
                color: '#0d1323',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '1.1rem',
                flexShrink: 0,
                marginTop: '0.2rem'
              }}>
                3
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.5rem' }}>
                  Review your list
                </h3>
                <p style={{ fontSize: '0.925rem', color: '#94a3b8', lineHeight: '1.5', margin: 0 }}>
                  Filter by chance level and shortlist the seats that fit.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', width: '100%' }} />

      {/* ---------------- 4. READY TO SEE YOUR OPTIONS CTA ---------------- */}
      <section style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div className="wrap" style={{ width: '100%', maxWidth: '700px', margin: '0 auto' }}>
          
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            fontWeight: '800',
            color: '#ffffff',
            letterSpacing: '-0.02em',
            marginBottom: '0.85rem'
          }}>
            Ready to see your options?
          </h2>

          <p style={{
            fontSize: '1.1rem',
            color: '#94a3b8',
            marginBottom: '2.25rem',
            fontWeight: '400'
          }}>
            It takes under a minute and needs no sign-up.
          </p>

          <div>
            <Link
              to="/predictor"
              className="btn btn-yellow"
              style={{
                padding: '0.9rem 2.25rem',
                fontSize: '1.1rem',
                fontWeight: '700',
                borderRadius: '10px',
                display: 'inline-block'
              }}
            >
              Find my colleges
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}