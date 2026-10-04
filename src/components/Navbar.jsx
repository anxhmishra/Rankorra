import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { readShortlist, subscribeShortlist } from '../utils/shortlist';

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [shortlistCount, setShortlistCount] = useState(() => readShortlist().length);

  // Keep the count live when seats are shortlisted
  useEffect(() => subscribeShortlist(() => setShortlistCount(readShortlist().length)), []);

  // Close the phone menu after navigating, and on the Escape key
  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => setOpen(false);
  const link = (to, label) => (
    <Link to={to} onClick={close} className={`nav-link ${location.pathname === to ? 'active' : ''}`}
      aria-current={location.pathname === to ? 'page' : undefined}>
      {label}
    </Link>
  );

  return (
    <header className="navbar">
      <div className="wrap navbar-inner">
        <Link to="/" className="logo" onClick={close}>SeatWise</Link>

        <button type="button" className="nav-toggle" aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open} aria-controls="primary-nav" onClick={() => setOpen((o) => !o)}>
          <span className="nav-toggle-bars" aria-hidden="true" />
        </button>

        <nav id="primary-nav" className={`nav-links${open ? ' open' : ''}`}>
          {link('/', 'Home')}
          {link('/predictor', 'Predictor')}
          {link('/compare', `Choice list (${shortlistCount})`)}
          <Link to="/predictor" onClick={close} className="btn btn-yellow nav-cta">Find my College!</Link>
        </nav>
      </div>
    </header>
  );
}
