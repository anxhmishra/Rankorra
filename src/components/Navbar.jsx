import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const shortlistCount = JSON.parse(localStorage.getItem('shortlist') || '[]').length;

  return (
    <header className="navbar">
      <div className="wrap navbar-inner">
        <Link to="/" className="logo">SeatWise</Link>
        <nav className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/predictor" className={`nav-link ${location.pathname === '/predictor' ? 'active' : ''}`}>
            Predictor
          </Link>
          <Link to="/compare" className={`nav-link ${location.pathname === '/compare' ? 'active' : ''}`}>
            Choice list ({shortlistCount})
          </Link>

          <Link to="/predictor" className="btn btn-yellow" style={{ padding: '0.5rem 1.1rem', fontSize: '0.9rem' }}>
            Find my College!
          </Link>
        </nav>
      </div>
    </header>
  );
}