import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ListItem } from '../../types/prismate';

export interface HistoryEntry {
  id: string;
  question: string;
  correctAnswer: string;
  userAnswer?: string;
  isCorrect: boolean;
  subject: string;
  timestamp: string;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  weaklist: ListItem[];
  onResetHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  weaklist,
  onResetHistory,
}) => {
  const [filter, setFilter] = useState<'all' | 'mistakes' | 'correct'>('all');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const displayEntries = history.filter((entry) => {
    if (filter === 'mistakes') return !entry.isCorrect;
    if (filter === 'correct') return entry.isCorrect;
    return true;
  });

  const handleConfirmReset = () => {
    onResetHistory();
    setShowConfirmReset(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="history-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9600,
            background: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <motion.div
            key="history-modal-card"
            initial={{ opacity: 0, scale: 0.92, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: 'min(580px, 94vw)',
            background: 'linear-gradient(135deg, rgba(24, 24, 24, 0.98), rgba(12, 12, 12, 0.95))',
            border: '1.5px solid rgba(242, 242, 242, 0.25)',
            borderRadius: '20px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(242, 242, 242, 0.2)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
              borderBottom: '1px solid rgba(242, 242, 242, 0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>📜</span>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '13px',
                  letterSpacing: '2px',
                  color: '#F2F2F2',
                }}
              >
                PREVIOUS ATTEMPTS & MISTAKES LOG
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(242, 242, 242, 0.6)',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'all', label: `ALL (${history.length})` },
                { id: 'mistakes', label: `MISTAKES (${history.filter((h) => !h.isCorrect).length})` },
                { id: 'correct', label: `MASTERED (${history.filter((h) => h.isCorrect).length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  style={{
                    background: filter === tab.id ? '#F2F2F2' : 'rgba(242, 242, 242, 0.08)',
                    color: filter === tab.id ? '#000000' : '#F2F2F2',
                    border: '1px solid rgba(242, 242, 242, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '10px',
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* List of Entries */}
            <div
              style={{
                maxHeight: '260px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                paddingRight: '4px',
              }}
            >
              {displayEntries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 0', color: 'rgba(242,242,242,0.4)', fontSize: '12px' }}>
                  No drill history recorded yet. Answer questions in the Active Quiz widget to populate logs.
                </div>
              ) : (
                displayEntries.map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      padding: '12px 14px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: `1px solid ${entry.isCorrect ? 'rgba(242, 242, 242, 0.12)' : 'rgba(235, 16, 75, 0.25)'}`,
                      borderRadius: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '10px',
                          letterSpacing: '1px',
                          color: entry.isCorrect ? '#F2F2F2' : '#EB104B',
                          textTransform: 'uppercase',
                        }}
                      >
                        {entry.isCorrect ? '✓ CORRECT' : '✗ MISTAKE'} • {entry.subject}
                      </span>
                      <span style={{ fontSize: '10px', color: 'rgba(242,242,242,0.35)', fontFamily: 'monospace' }}>
                        {entry.timestamp}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: 'var(--font-content)',
                        fontSize: '12px',
                        lineHeight: 1.4,
                        color: '#F2F2F2',
                      }}
                    >
                      {entry.question}
                    </p>
                    <div style={{ fontSize: '11px', color: 'rgba(242,242,242,0.6)', fontFamily: 'var(--font-content)' }}>
                      Correct Answer: <span style={{ color: '#F2F2F2', fontWeight: 'bold' }}>{entry.correctAnswer}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* INTEGRATED RESET BOX ("box within the box to the pop up") */}
            <div
              style={{
                border: '1px dashed rgba(242, 242, 242, 0.25)',
                borderRadius: '12px',
                padding: '14px 18px',
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '12px',
                      letterSpacing: '1.5px',
                      color: '#F2F2F2',
                      display: 'block',
                    }}
                  >
                    RESET DRILL & MISTAKE RECORDS
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-content)',
                      fontSize: '11px',
                      color: 'rgba(242, 242, 242, 0.45)',
                    }}
                  >
                    Wipes all logged mistakes ({weaklist.length} issues) and history records
                  </span>
                </div>
                {!showConfirmReset ? (
                  <button
                    onClick={() => setShowConfirmReset(true)}
                    style={{
                      background: 'rgba(235, 16, 75, 0.15)',
                      border: '1px solid #EB104B',
                      color: '#EB104B',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      letterSpacing: '1px',
                    }}
                  >
                    RESET ALL
                  </button>
                ) : null}
              </div>

              {/* Confirmation box inside the box */}
              {showConfirmReset && (
                <div
                  style={{
                    background: 'rgba(235, 16, 75, 0.1)',
                    border: '1px solid rgba(235, 16, 75, 0.4)',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-subheading)',
                      fontSize: '11px',
                      color: '#F2F2F2',
                      letterSpacing: '0.5px',
                    }}
                  >
                    ⚠️ Are you sure you want to permanently clear all mistake logs? This cannot be undone.
                  </span>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setShowConfirmReset(false)}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(242, 242, 242, 0.25)',
                        color: '#F2F2F2',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={handleConfirmReset}
                      style={{
                        background: '#EB104B',
                        border: 'none',
                        color: '#FFFFFF',
                        borderRadius: '6px',
                        padding: '6px 14px',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      CONFIRM RESET
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
  );
};

export default HistoryModal;
