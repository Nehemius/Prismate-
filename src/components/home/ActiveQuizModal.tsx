import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ListType, ListItem } from '../../types/prismate';

export type ActiveQuizFilter = 'all' | ListType;
export type SubjectFilter = 'all' | 'physics' | 'chemistry' | 'mathematics';

interface ActiveQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilter: ActiveQuizFilter;
  onSelectFilter: (filter: ActiveQuizFilter) => void;
  subjectFilter: SubjectFilter;
  onSelectSubjectFilter: (sub: SubjectFilter) => void;
  weaklist: ListItem[];
  stronglist: ListItem[];
  studylist: ListItem[];
  totalAnswered: number;
}

export const ActiveQuizModal: React.FC<ActiveQuizModalProps> = ({
  isOpen,
  onClose,
  activeFilter,
  onSelectFilter,
  subjectFilter,
  onSelectSubjectFilter,
  weaklist,
  stronglist,
  studylist,
  totalAnswered,
}) => {
  if (!isOpen) return null;

  const totalEvaluated = weaklist.length + stronglist.length;
  const accuracy =
    totalEvaluated > 0 ? Math.round((stronglist.length / totalEvaluated) * 100) : 100;

  const weakPhysics = weaklist.filter((i) => i.subject === 'physics').length;
  const weakChem = weaklist.filter((i) => i.subject === 'chemistry').length;
  const weakMath = weaklist.filter((i) => i.subject === 'mathematics').length;

  return (
    <AnimatePresence>
      <div
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
          initial={{ opacity: 0, scale: 0.92, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: 'min(520px, 94vw)',
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
              <span style={{ fontSize: '18px' }}>🎯</span>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '13px',
                  letterSpacing: '2px',
                  color: '#F2F2F2',
                }}
              >
                ACTIVE QUIZ SOURCE & STATISTICS
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

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Statistics Banner */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
                padding: '16px',
                background: 'rgba(0, 0, 0, 0.45)',
                borderRadius: '14px',
                border: '1px solid rgba(242, 242, 242, 0.1)',
                textAlign: 'center',
              }}
            >
              <div>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', color: '#F2F2F2' }}>
                  {totalAnswered}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '9px',
                    letterSpacing: '1px',
                    color: 'rgba(242,242,242,0.45)',
                    marginTop: '4px',
                  }}
                >
                  DRILLS TAKEN
                </span>
              </div>
              <div>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', color: '#F2F2F2' }}>
                  {accuracy}%
                </span>
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '9px',
                    letterSpacing: '1px',
                    color: 'rgba(242,242,242,0.45)',
                    marginTop: '4px',
                  }}
                >
                  ACCURACY
                </span>
              </div>
              <div>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', color: '#EB104B' }}>
                  {weaklist.length}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '9px',
                    letterSpacing: '1px',
                    color: 'rgba(242,242,242,0.45)',
                    marginTop: '4px',
                  }}
                >
                  WEAK ISSUES
                </span>
              </div>
              <div>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', color: '#F2F2F2' }}>
                  {stronglist.length}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '9px',
                    letterSpacing: '1px',
                    color: 'rgba(242,242,242,0.45)',
                    marginTop: '4px',
                  }}
                >
                  STRONG MASTERED
                </span>
              </div>
            </div>

            {/* List Source Filter */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '11px',
                  letterSpacing: '1.5px',
                  color: 'rgba(242, 242, 242, 0.5)',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                SELECT QUIZ SOURCE LIST
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { id: 'all', label: 'ALL (116 Qs)', count: 116 },
                  { id: 'weaklist', label: 'WEAK LIST', count: weaklist.length },
                  { id: 'stronglist', label: 'STRONG LIST', count: stronglist.length },
                  { id: 'studylist', label: 'STUDY LIST', count: studylist.length },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelectFilter(item.id as ActiveQuizFilter)}
                    style={{
                      background: activeFilter === item.id ? '#F2F2F2' : 'rgba(242, 242, 242, 0.08)',
                      color: activeFilter === item.id ? '#000000' : '#F2F2F2',
                      border: '1px solid rgba(242, 242, 242, 0.2)',
                      borderRadius: '8px',
                      padding: '10px 4px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '10px',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div>{item.label}</div>
                    <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '2px' }}>
                      ({item.count})
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Focus Filter */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '11px',
                  letterSpacing: '1.5px',
                  color: 'rgba(242, 242, 242, 0.5)',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                SUBJECT FOCUS
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { id: 'all', label: 'ALL SUBJECTS' },
                  { id: 'physics', label: 'PHYSICS' },
                  { id: 'chemistry', label: 'CHEMISTRY' },
                  { id: 'mathematics', label: 'MATHEMATICS' },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => onSelectSubjectFilter(sub.id as SubjectFilter)}
                    style={{
                      background: subjectFilter === sub.id ? '#F2F2F2' : 'rgba(242, 242, 242, 0.08)',
                      color: subjectFilter === sub.id ? '#000000' : '#F2F2F2',
                      border: '1px solid rgba(242, 242, 242, 0.2)',
                      borderRadius: '8px',
                      padding: '8px 4px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Weak Issues Breakdown by Lesson */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '11px',
                  letterSpacing: '1.5px',
                  color: 'rgba(242, 242, 242, 0.5)',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                WEAK ISSUES BY CHAPTER 1 LESSON
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'rgba(0, 0, 0, 0.35)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-content)',
                  }}
                >
                  <span style={{ color: '#F2F2F2' }}>Physics: Unit 1 Electrostatics</span>
                  <span style={{ color: weakPhysics > 0 ? '#EB104B' : 'rgba(242,242,242,0.4)' }}>
                    {weakPhysics} issue{weakPhysics === 1 ? '' : 's'}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'rgba(0, 0, 0, 0.35)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-content)',
                  }}
                >
                  <span style={{ color: '#F2F2F2' }}>Chemistry: Unit 1 Metallurgy</span>
                  <span style={{ color: weakChem > 0 ? '#EB104B' : 'rgba(242,242,242,0.4)' }}>
                    {weakChem} issue{weakChem === 1 ? '' : 's'}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'rgba(0, 0, 0, 0.35)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-content)',
                  }}
                >
                  <span style={{ color: '#F2F2F2' }}>Math: Unit 1 Applications of Matrices</span>
                  <span style={{ color: weakMath > 0 ? '#EB104B' : 'rgba(242,242,242,0.4)' }}>
                    {weakMath} issue{weakMath === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
            </div>

            {/* Done Button */}
            <button
              onClick={onClose}
              style={{
                width: '100%',
                background: '#F2F2F2',
                color: '#000000',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontFamily: 'var(--font-heading)',
                fontSize: '12px',
                letterSpacing: '2px',
                cursor: 'pointer',
              }}
            >
              APPLY & RESUME DRILLS
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ActiveQuizModal;
