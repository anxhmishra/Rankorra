// src/pages/FAQ.jsx
import React, { useState } from 'react';

const faqs = [
  {
    q: "How does the Rankorra Predictor calculate my college chances?",
    a: "Rankorra parses official JoSAA and CSAB closing rank data. It compares your rank, category, quota, and gender pool against historical closing ranks to assign Safe (95%+), Target (68%), and Reach (40%) probabilities."
  },
  {
    q: "What is the difference between Home State (HS) and Other State (OS) quotas?",
    a: "NITs, IIITs, and GFTIs reserve ~50% of seats for candidates belonging to the state where the institute is located (HS quota). Candidates from all other states compete under the OS (Other State) or AI (All India) quota."
  },
  {
    q: "How accurate is the closing rank data?",
    a: "Our predictions are calculated directly from verified final-round closing ranks from recent JoSAA/CSAB counselling cycles."
  },
  {
    q: "How do I save and order my preferences for choice filling?",
    a: "Click 'Shortlist' on any result card in the Predictor. Then head over to the Choice List page where you can reorder choices using the arrow buttons and export the entire list as a CSV file for official JoSAA choice filling."
  },
  {
    q: "Is Rankorra affiliated with NTA or JoSAA?",
    a: "No, Rankorra is an independent reference engine built to assist engineering candidates during college counselling."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="wrap pad">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Frequently Asked Questions</h2>
        <p className="lead">Everything you need to know about JoSAA, CSAB, and seat prediction.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxWidth: '850px' }}>
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={idx} 
              className="card" 
              onClick={() => toggleFAQ(idx)}
              style={{ 
                padding: '1.25rem 1.5rem', 
                cursor: 'pointer',
                borderColor: isOpen ? 'rgba(245, 158, 11, 0.4)' : 'var(--card-border)',
                transition: 'border-color 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--ink)' }}>{faq.q}</h3>
                <span style={{ fontSize: '1.25rem', color: 'var(--accent)', marginLeft: '1rem', fontWeight: '800' }}>
                  {isOpen ? '−' : '+'}
                </span>
              </div>
              {isOpen && (
                <p style={{ marginTop: '0.85rem', color: 'var(--ink2)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                  {faq.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}