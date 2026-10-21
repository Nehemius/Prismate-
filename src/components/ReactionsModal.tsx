import React, { useState } from 'react';
import { motion } from 'motion/react';
import { INITIAL_REACTIONS } from '../data/mockData';
import { useApp } from '../context/useApp';

interface ReactionsModalProps {
  onClose: () => void;
}

export const ReactionsModal: React.FC<ReactionsModalProps> = ({ onClose }) => {
  const { addToList, isInList } = useApp();
  const [selectedChapter, setSelectedChapter] = useState<string>('All');
  const [search, setSearch] = useState('');

  const chapters = ['All', 'Carbonyl Compounds', 'Haloalkanes & Haloarenes', 'Organic Nitrogen Compounds', 'Coordination Chemistry'];

  const filteredReactions = INITIAL_REACTIONS.filter((rx) => {
    const matchesChapter = selectedChapter === 'All' || rx.chapter === selectedChapter;
    const matchesSearch =
      rx.name.toLowerCase().includes(search.toLowerCase()) ||
      rx.equation.toLowerCase().includes(search.toLowerCase());
    return matchesChapter && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 4000,
        background: 'rgba(0, 0, 0, 0.88)',
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
          padding: '24px 32px',
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
            }}
          >
            LESSON-WISE REACTIONS
          </h2>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search reaction name or formula..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: 'rgba(242,242,242,0.06)',
            border: '1px solid rgba(242,242,242,0.18)',
            borderRadius: '6px',
            padding: '8px 16px',
            color: '#F2F2F2',
            fontFamily: 'var(--font-content)',
            fontSize: '13px',
            width: '280px',
            outline: 'none',
          }}
        />
      </div>

      {/* Chapter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '16px 32px',
          borderBottom: '1px solid rgba(242,242,242,0.08)',
          overflowX: 'auto',
        }}
      >
        {chapters.map((ch) => (
          <button
            key={ch}
            onClick={() => setSelectedChapter(ch)}
            style={{
              background: selectedChapter === ch ? '#F2F2F2' : 'transparent',
              border: '1px solid rgba(242,242,242,0.15)',
              borderRadius: '20px',
              padding: '6px 16px',
              color: selectedChapter === ch ? '#000000' : '#F2F2F2',
              fontFamily: 'var(--font-subheading)',
              fontSize: '11px',
              letterSpacing: '1px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {ch}
          </button>
        ))}
      </div>

      {/* Reaction Cards Grid */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))',
          gap: '20px',
          alignContent: 'start',
        }}
      >
        {filteredReactions.map((rx) => {
          const inWeak = isInList('weaklist', rx.name);
          const inStudy = isInList('studylist', rx.name);

          return (
            <div
              key={rx.id}
              style={{
                background: 'linear-gradient(135deg, rgba(16,16,16,0.92), rgba(26,26,26,0.80))',
                border: '1px solid rgba(242,242,242,0.12)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '11px',
                    color: 'rgba(242,242,242,0.4)',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}
                >
                  {rx.chapter}
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '18px',
                    color: '#F2F2F2',
                    letterSpacing: '1.5px',
                    margin: '6px 0 16px',
                  }}
                >
                  {rx.name}
                </h3>

                {/* Equation Box */}
                <div
                  style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(242,242,242,0.15)',
                    borderRadius: '8px',
                    padding: '14px 18px',
                    fontFamily: 'monospace',
                    fontSize: '15px',
                    color: '#F2F2F2',
                    marginBottom: '16px',
                    overflowX: 'auto',
                  }}
                >
                  {rx.equation}
                </div>

                <div style={{ fontSize: '12px', fontFamily: 'var(--font-content)', lineHeight: 1.6, color: 'rgba(242,242,242,0.7)' }}>
                  <p><strong>Reactants:</strong> {rx.reactants}</p>
                  <p><strong>Products:</strong> {rx.products}</p>
                  <p><strong>Conditions:</strong> {rx.conditions}</p>
                  {rx.mechanismNote && (
                    <p style={{ marginTop: '8px', color: 'rgba(242,242,242,0.5)', fontStyle: 'italic' }}>
                      Note: {rx.mechanismNote}
                    </p>
                  )}
                </div>
              </div>

              {/* Bookmark buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderTop: '1px solid rgba(242,242,242,0.08)', paddingTop: '16px' }}>
                <button
                  onClick={() =>
                    addToList('weaklist', {
                      subject: 'chemistry',
                      category: 'reaction',
                      title: rx.name,
                      content: rx.equation,
                      source: rx.chapter,
                    })
                  }
                  style={{
                    flex: 1,
                    background: inWeak ? 'rgba(235,16,75,0.2)' : 'rgba(242,242,242,0.05)',
                    border: inWeak ? '1px solid #EB104B' : '1px solid rgba(242,242,242,0.15)',
                    color: inWeak ? '#EB104B' : '#F2F2F2',
                    borderRadius: '6px',
                    padding: '8px',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  {inWeak ? '★ IN WEAKLIST' : '+ WEAKLIST'}
                </button>
                <button
                  onClick={() =>
                    addToList('studylist', {
                      subject: 'chemistry',
                      category: 'reaction',
                      title: rx.name,
                      content: rx.equation,
                      source: rx.chapter,
                    })
                  }
                  style={{
                    flex: 1,
                    background: inStudy ? 'rgba(242,242,242,0.2)' : 'rgba(242,242,242,0.05)',
                    border: inStudy ? '1px solid #F2F2F2' : '1px solid rgba(242,242,242,0.15)',
                    color: '#F2F2F2',
                    borderRadius: '6px',
                    padding: '8px',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  {inStudy ? '✓ IN STUDYLIST' : '+ STUDYLIST'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ReactionsModal;
