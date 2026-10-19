import React, { useState } from 'react';
import { INITIAL_DIAGRAMS } from '../data/mockData';
import { useApp } from '../context/AppContext';

interface DiagramsModalProps {
  subject: 'chemistry' | 'physics' | 'mathematics';
  onClose: () => void;
}

export const DiagramsModal: React.FC<DiagramsModalProps> = ({ subject, onClose }) => {
  const { addToList, isInList } = useApp();
  const subjectDiagrams = INITIAL_DIAGRAMS.filter((d) => d.subject === subject);
  const [activeDiagram, setActiveDiagram] = useState(subjectDiagrams[0] || INITIAL_DIAGRAMS[0]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 4000,
        background: 'rgba(0, 0, 0, 0.92)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 32px',
          borderBottom: '1px solid rgba(242,242,242,0.12)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid rgba(242,242,242,0.25)',
              borderRadius: '6px',
              color: '#F2F2F2',
              fontFamily: 'var(--font-subheading)',
              fontSize: '11px',
              letterSpacing: '2px',
              padding: '6px 14px',
              cursor: 'pointer',
            }}
          >
            ← BACK
          </button>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '20px',
              letterSpacing: '3px',
              margin: 0,
              textTransform: 'uppercase',
            }}
          >
            {subject} CONCEPT DIAGRAMS
          </h2>
        </div>
      </div>

      {/* Main split canvas */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Diagram Selector List */}
        <div
          style={{
            width: '320px',
            borderRight: '1px solid rgba(242,242,242,0.12)',
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {subjectDiagrams.map((diag) => {
            const isSelected = activeDiagram.id === diag.id;
            return (
              <button
                key={diag.id}
                onClick={() => setActiveDiagram(diag)}
                style={{
                  background: isSelected ? '#F2F2F2' : 'rgba(242,242,242,0.04)',
                  border: '1px solid rgba(242,242,242,0.15)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  color: isSelected ? '#000000' : '#F2F2F2',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '10px',
                    letterSpacing: '1px',
                    display: 'block',
                    opacity: 0.6,
                    marginBottom: '4px',
                  }}
                >
                  {diag.chapter}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '13px',
                    letterSpacing: '1px',
                    display: 'block',
                  }}
                >
                  {diag.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Active Diagram View */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '32px 48px',
            overflowY: 'auto',
          }}
        >
          {/* Visual SVG Diagram Canvas */}
          <div
            style={{
              width: '100%',
              height: '380px',
              background: 'linear-gradient(135deg, rgba(16,16,16,0.95), rgba(8,8,8,0.9))',
              border: '1px solid rgba(242,242,242,0.15)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '24px',
            }}
          >
            {/* SVG Schematic representation */}
            <svg viewBox="0 0 600 300" style={{ width: '80%', height: '80%' }}>
              <rect x="50" y="50" width="220" height="200" rx="8" fill="rgba(242,242,242,0.04)" stroke="rgba(242,242,242,0.3)" strokeWidth="2" />
              <rect x="330" y="50" width="220" height="200" rx="8" fill="rgba(242,242,242,0.04)" stroke="rgba(242,242,242,0.3)" strokeWidth="2" />
              <path d="M 230 110 L 230 40 L 370 40 L 370 110" fill="none" stroke="#F2F2F2" strokeWidth="3" strokeDasharray="4 4" />
              <text x="300" y="30" fill="#F2F2F2" fontSize="12" textAnchor="middle" fontFamily="sans-serif">SALT BRIDGE (KCl)</text>
              <rect x="80" y="80" width="30" height="150" fill="rgba(242,242,242,0.2)" stroke="#F2F2F2" />
              <text x="95" y="250" fill="rgba(242,242,242,0.6)" fontSize="11" textAnchor="middle" fontFamily="sans-serif">Zn Anode (-)</text>
              <rect x="490" y="80" width="30" height="150" fill="rgba(242,242,242,0.2)" stroke="#F2F2F2" />
              <text x="505" y="250" fill="rgba(242,242,242,0.6)" fontSize="11" textAnchor="middle" fontFamily="sans-serif">Cu Cathode (+)</text>
              <line x1="95" y1="80" x2="95" y2="10" stroke="#F2F2F2" strokeWidth="2" />
              <line x1="95" y1="10" x2="280" y2="10" stroke="#F2F2F2" strokeWidth="2" />
              <circle cx="300" cy="10" r="14" fill="#000000" stroke="#F2F2F2" strokeWidth="2" />
              <text x="300" y="14" fill="#F2F2F2" fontSize="10" textAnchor="middle" fontFamily="sans-serif">1.10V</text>
              <line x1="320" y1="10" x2="505" y2="10" stroke="#F2F2F2" strokeWidth="2" />
              <line x1="505" y1="10" x2="505" y2="80" stroke="#F2F2F2" strokeWidth="2" />
            </svg>
          </div>

          {/* Diagram Info & Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-subheading)', fontSize: '11px', color: 'rgba(242,242,242,0.4)', letterSpacing: '1px' }}>
                {activeDiagram.chapter}
              </span>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', letterSpacing: '2px', margin: '4px 0 12px' }}>
                {activeDiagram.title}
              </h3>
              <p style={{ fontFamily: 'var(--font-content)', fontSize: '14px', lineHeight: 1.6, color: 'rgba(242,242,242,0.7)', maxWidth: '720px' }}>
                {activeDiagram.description}
              </p>
            </div>

            <button
              onClick={() =>
                addToList('studylist', {
                  subject,
                  category: 'diagram',
                  title: activeDiagram.title,
                  content: activeDiagram.description,
                  source: activeDiagram.chapter,
                })
              }
              style={{
                background: isInList('studylist', activeDiagram.title) ? '#F2F2F2' : 'transparent',
                color: isInList('studylist', activeDiagram.title) ? '#000000' : '#F2F2F2',
                border: '1px solid rgba(242,242,242,0.3)',
                borderRadius: '8px',
                padding: '12px 20px',
                fontFamily: 'var(--font-heading)',
                fontSize: '11px',
                letterSpacing: '1px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {isInList('studylist', activeDiagram.title) ? '✓ SAVED IN STUDYLIST' : '+ SAVE TO STUDYLIST'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagramsModal;
