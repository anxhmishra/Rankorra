import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/animations.css';
import '../styles/landing.css';

const LADDER = [
  { cls: 'reach', name: 'NIT Trichy', branch: 'Computer Science', rank: '1,420', label: 'Reach' },
  { cls: 'target', name: 'NIT Warangal', branch: 'Electronics & Comm.', rank: '3,980', label: 'Target' },
  { cls: 'safe', name: 'IIIT Allahabad', branch: 'Information Technology', rank: '6,210', label: 'Safe' },
];

const FEATURES = [
  ['Trained on past cutoffs', 'Our model learns from previous JoSAA rounds, so results follow real closing ranks.'],
  ['Made for your profile', 'Rank, category, gender and home state all change which seats you can get. We account for every one.'],
  ['Safe, target or reach', 'Every option is tagged, so you can build a choice list with a sensible spread.'],
  ['Branch-first search', 'Pick the branches you care about and see only those, across all institutes.'],
];

const STEPS = [
  ['Enter your details', 'Rank, category, gender and quota.'],
  ['Pick a branch', 'Choose the branch you would like to study.'],
  ['Review your list', 'Filter by chance level and shortlist the seats that fit.'],
];

const Divider = () => <div className="lp-divider" />;

export default function Landing() {
  return (
    <div className="lp-page animate-page-entry">

      <section className="lp-hero">
        <div className="lp-inner lp-hero-grid">
          <div className="lp-copy animate-fade-in-up">
            <h1 className="lp-title">Know where your rank can take you, before choice filling begins.</h1>
            <p className="lp-lead">
              Rankorra predicts which IITs, NITs, IIITs and GFTIs you can realistically get, using your JEE rank and past JoSAA cutoffs.
            </p>
            <div className="lp-actions">
              <Link to="/predictor" className="btn btn-yellow lp-btn-main">Find my colleges</Link>
              <a href="#how-it-works" className="btn btn-secondary lp-btn-ghost lp-btn-main">How it works</a>
            </div>
          </div>

          <div className="lp-ladder animate-ladder-float">
            {LADDER.map((c) => (
              <div key={c.name} className={`ladder-card ${c.cls}`}>
                <div>
                  <h3>{c.name}</h3>
                  <p>{c.branch}</p>
                </div>
                <div className="lp-right">
                  <span className="lp-rank">{c.rank}</span>
                  <span className={`lp-tag ${c.cls}`}>{c.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      <section className="lp-section">
        <div className="lp-inner">
          <h2 className="lp-h2">Why students use it</h2>
          <div className="lp-features">
            {FEATURES.map(([title, text]) => (
              <div key={title} className="feature-card interactive-card lp-card">
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      <section id="how-it-works" className="lp-section">
        <div className="lp-inner">
          <h2 className="lp-h2 lp-h2-lg">How it works</h2>
          <div className="lp-steps">
            {STEPS.map(([title, text], i) => (
              <div key={title} className="lp-step">
                <div className="lp-step-num">{i + 1}</div>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      <section className="lp-cta">
        <div className="lp-inner">
          <h2>Ready to see your options?</h2>
          <p>It takes under a minute and needs no sign-up.</p>
          <Link to="/predictor" className="btn btn-yellow lp-btn-cta">Find my colleges</Link>
        </div>
      </section>

    </div>
  );
}
