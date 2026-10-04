import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Predictor from './pages/Predictor';
import Compare from './pages/Compare';
import FAQ from './pages/FAQ';

export default function App() {
  return (
    <div className="app">
      <Navbar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/predictor" element={<Predictor />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/faq" element={<FAQ />} />
        </Routes>
      </main>

      <footer>
        <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Rankorra</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
Trained on Official JoSAA/CSAB Data
          </span>
        </div>
      </footer>
    </div>
  );
}