import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_DIAGRAMS } from '../data/mockData';
import { useApp } from '../context/useApp';
import Orbital3DViewer from './chemistry/Orbital3DViewer';
import InteractiveGraphModal from './math/InteractiveGraphModal';

interface DiagramsModalProps {
  subject: 'chemistry' | 'physics' | 'mathematics';
  onClose: () => void;
}

export const DiagramsModal: React.FC<DiagramsModalProps> = ({ subject, onClose }) => {
  const { addToList, isInList, theme } = useApp();
  const isLight = theme === 'light';

  const subjectDiagrams = INITIAL_DIAGRAMS.filter((d) => d.subject === subject);
  const [activeDiagram, setActiveDiagram] = useState(subjectDiagrams[0] || INITIAL_DIAGRAMS[0]);
  const [showInteractiveGraph, setShowInteractiveGraph] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 4000,
          background: isLight ? 'rgba(238, 242, 248, 0.96)' : 'rgba(0, 0, 0, 0.94)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          overflow: 'hidden',
          color: isLight ? '#111114' : '#F2F2F2',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 32px',
            borderBottom: isLight ? '1px solid rgba(0,0,0,0.12)' : '1px solid rgba(242,242,242,0.12)',
            background: isLight ? '#FFFFFF' : 'rgba(10, 10, 14, 0.85)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: isLight ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(242,242,242,0.25)',
                borderRadius: '6px',
                color: isLight ? '#111114' : '#F2F2F2',
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
                color: isLight ? '#111114' : '#FFFFFF',
              }}
            >
              {subject} CONCEPT DIAGRAMS
            </h2>
          </div>

          {/* Quick link to Interactive Graph for Math */}
          {subject === 'mathematics' && (
            <button
              onClick={() => setShowInteractiveGraph(true)}
              style={{
                background: isLight ? '#111114' : '#38BDF8',
                color: isLight ? '#FFFFFF' : '#000000',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontFamily: 'var(--font-heading)',
                fontSize: '11px',
                letterSpacing: '1px',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              📈 OPEN INTERACTIVE GRAPH
            </button>
          )}
        </div>

        {/* Main Canvas Body */}
        {subject === 'chemistry' ? (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Left Diagram Selector List */}
            <div
              style={{
                width: '320px',
                borderRight: isLight ? '1px solid rgba(0,0,0,0.12)' : '1px solid rgba(242,242,242,0.12)',
                padding: '20px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                background: isLight ? '#FFFFFF' : 'rgba(12, 14, 20, 0.6)',
              }}
            >
              {subjectDiagrams.map((diag) => {
                const isSelected = activeDiagram.id === diag.id;
                return (
                  <button
                    key={diag.id}
                    onClick={() => setActiveDiagram(diag)}
                    style={{
                      background: isSelected
                        ? (isLight ? '#111114' : '#F2F2F2')
                        : (isLight ? 'rgba(0,0,0,0.03)' : 'rgba(242,242,242,0.04)'),
                      border: isLight
                        ? (isSelected ? '1px solid #111114' : '1px solid rgba(0,0,0,0.12)')
                        : (isSelected ? '1px solid #F2F2F2' : '1px solid rgba(242,242,242,0.15)'),
                      borderRadius: '10px',
                      padding: '14px 16px',
                      color: isSelected
                        ? (isLight ? '#FFFFFF' : '#000000')
                        : (isLight ? '#111114' : '#F2F2F2'),
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isLight && isSelected ? '0 4px 14px rgba(0,0,0,0.15)' : 'none',
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

            {/* Right Active 3D Diagram View */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 32px',
                overflowY: 'auto',
              }}
            >
              {/* 3D Orbital Viewer Component */}
              <div
                style={{
                  width: '100%',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: isLight ? '1.5px solid rgba(0,0,0,0.14)' : '1px solid rgba(255,255,255,0.15)',
                  boxShadow: isLight
                    ? '0 12px 36px rgba(0,0,0,0.08)'
                    : '0 16px 40px rgba(0,0,0,0.6)',
                  marginBottom: '20px',
                }}
              >
                <Orbital3DViewer isLight={isLight} />
              </div>

              {/* Diagram Info & Action buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                <div>
                  <span
                    style={{
                      fontFamily: 'var(--font-subheading)',
                      fontSize: '11px',
                      color: isLight ? '#6B7280' : 'rgba(242,242,242,0.4)',
                      letterSpacing: '1px',
                    }}
                  >
                    {activeDiagram.chapter}
                  </span>
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '22px',
                      letterSpacing: '2px',
                      margin: '4px 0 10px',
                      color: isLight ? '#111114' : '#FFFFFF',
                    }}
                  >
                    {activeDiagram.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-content)',
                      fontSize: '14px',
                      lineHeight: 1.6,
                      color: isLight ? '#374151' : 'rgba(242,242,242,0.7)',
                      maxWidth: '720px',
                      margin: 0,
                    }}
                  >
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
                    background: isInList('studylist', activeDiagram.title)
                      ? (isLight ? '#111114' : '#F2F2F2')
                      : 'transparent',
                    color: isInList('studylist', activeDiagram.title)
                      ? (isLight ? '#FFFFFF' : '#000000')
                      : (isLight ? '#111114' : '#F2F2F2'),
                    border: isLight ? '1.5px solid rgba(0,0,0,0.25)' : '1px solid rgba(242,242,242,0.3)',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '11px',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontWeight: 600,
                  }}
                >
                  {isInList('studylist', activeDiagram.title) ? '✓ SAVED IN STUDYLIST' : '+ SAVE TO STUDYLIST'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Sleek Coming Soon Placeholder View for Physics and Mathematics */
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: isLight ? 'rgba(0,119,238,0.12)' : 'rgba(56,189,248,0.15)',
                border: isLight ? '2px solid #0077EE' : '2px solid #38BDF8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                marginBottom: '20px',
              }}
            >
              {subject === 'physics' ? '⚡' : '📐'}
            </div>
            <span
              style={{
                fontFamily: 'var(--font-subheading)',
                fontSize: '11px',
                letterSpacing: '2px',
                color: isLight ? '#0077EE' : '#38BDF8',
                textTransform: 'uppercase',
                marginBottom: '8px',
                fontWeight: 600,
              }}
            >
              MODULE IN ACTIVE DEVELOPMENT
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '32px',
                letterSpacing: '4px',
                color: isLight ? '#111114' : '#FFFFFF',
                margin: '0 0 16px',
              }}
            >
              {subject.toUpperCase()} 3D DIAGRAMS COMING SOON
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-content)',
                fontSize: '15px',
                lineHeight: 1.6,
                color: isLight ? '#4B5563' : 'rgba(242,242,242,0.6)',
                maxWidth: '520px',
                marginBottom: '28px',
              }}
            >
              High-accuracy interactive schematic models for {subject} (Cyclotron, Van de Graaff, and 3D Geometry) are being calibrated for future release.
            </p>

            {subject === 'mathematics' ? (
              <button
                onClick={() => setShowInteractiveGraph(true)}
                style={{
                  background: isLight ? '#111114' : '#38BDF8',
                  color: isLight ? '#FFFFFF' : '#000000',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '14px 28px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '13px',
                  letterSpacing: '2px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  boxShadow: isLight ? '0 4px 16px rgba(0,0,0,0.16)' : '0 4px 20px rgba(56,189,248,0.3)',
                }}
              >
                OPEN INTERACTIVE GRAPH ENGINE →
              </button>
            ) : (
              <button
                onClick={onClose}
                style={{
                  background: isLight ? '#FFFFFF' : 'transparent',
                  color: isLight ? '#111114' : '#F2F2F2',
                  border: isLight ? '1.5px solid rgba(0,0,0,0.2)' : '1px solid rgba(242,242,242,0.25)',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '12px',
                  letterSpacing: '2px',
                  cursor: 'pointer',
                }}
              >
                RETURN TO WORKSPACE
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Interactive Graph Modal */}
      <AnimatePresence>
        {showInteractiveGraph && (
          <InteractiveGraphModal onClose={() => setShowInteractiveGraph(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default DiagramsModal;
