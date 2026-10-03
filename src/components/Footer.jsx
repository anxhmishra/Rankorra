// src/components/Footer.jsx
import React from 'react';

export default function Footer() {
  return (
    <footer className="foot" style={{ padding: '1rem 0' }}>
      <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ fontSize: '0.85rem' }}>
          <strong className="logo" style={{ fontSize: '1.1rem' }}>SeatWise</strong>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', fontSize: '0.85rem' }}>
          <a
            href="https://github.com/anxhmishra/College-Counselling-Model"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--ink2)', textDecoration: 'none', fontWeight: '500' }}
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}