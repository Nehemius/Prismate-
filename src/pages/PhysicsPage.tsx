import React, { useState, useRef } from 'react';
import DiagramsModal from '../components/DiagramsModal';
import PapersModal from '../components/PapersModal';
import QuizEngine from '../components/QuizEngine';
import { INITIAL_QUESTIONS } from '../data/mockData';
import { useApp } from '../context/AppContext';

/**
 * PhysicsPage — Tamil Nadu Class 11/12 Physics workspace.
 *
 * SPEC & HANDOVER COMPLIANCE (PRISMATE_UI_SPEC.md §6.1, §6.2):
 *   Blocks:
 *     1. Formula Quiz
 *     2. Unit Quiz
 *     3. Diagrams
 *     4. PTA Questions
 *     5. Board Exam QP
 *     6. Book Back (BB) One-Word Quiz
 *     + PHYSICS Centre Title Block (locked unmovable subject hub)
 *   - Subject Page Edit Mode (§6.1):
 *       * Blocks can be dragged to swap positions.
 *       * Centre title block remains locked at all times.
 */

interface PhysBlock {
  id: string;
  label: string;
  sub: string;
}

const PHYS_BLOCKS: PhysBlock[] = [
  { id: 'formula-quiz', label: 'Formula Quiz', sub: 'Electromagnetism & optics formulas' },
  { id: 'unit-quiz', label: 'Unit Quiz', sub: 'SI units and dimensional analysis' },
  { id: 'pta-qp', label: 'PTA Questions', sub: 'Practice with PTA question bank' },
  { id: 'board-qp', label: 'Board Exam QP', sub: 'Previous Tamil Nadu board papers' },
  { id: 'bb-quiz', label: 'BB One-Word Quiz', sub: 'Book Back objective drills' },
  { id: 'diagrams', label: 'Diagrams', sub: 'Cyclotron, Van de Graaff & circuits' },
];

interface BlockLayout {
  id: string;
  gridColumn: string;
  gridRow: string;
}

const DEFAULT_PHYS_LAYOUT: BlockLayout[] = [
  { id: 'formula-quiz', gridColumn: '1 / 11', gridRow: '1 / 4' },
  { id: 'unit-quiz', gridColumn: '11 / 17', gridRow: '1 / 4' },
  { id: 'pta-qp', gridColumn: '1 / 6', gridRow: '4 / 6' },
  { id: 'board-qp', gridColumn: '12 / 17', gridRow: '4 / 6' },
  { id: 'bb-quiz', gridColumn: '1 / 11', gridRow: '6 / 9' },
  { id: 'diagrams', gridColumn: '11 / 17', gridRow: '6 / 9' },
];

const TILE_BASE: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(16,16,16,0.85), rgba(28,28,28,0.72))',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'rgba(242,242,242,0.10)',
  borderRadius: '20px',
  boxShadow: 'inset 0 1px 0 0 rgba(242,242,242,0.22)',
  padding: 'clamp(16px, 2vw, 26px)',
  display: 'flex',
  flexDirection: 'column' as const,
  justifyContent: 'flex-end',
  cursor: 'pointer',
  transition: 'border-color 0.2s ease, background 0.2s ease, transform 0.2s ease',
  userSelect: 'none' as const,
  position: 'relative' as const,
  overflow: 'hidden' as const,
  boxSizing: 'border-box' as const,
  width: '100%',
  height: '100%',
};

interface TileProps {
  block: PhysBlock;
  isEditMode?: boolean;
  onActivate: (id: string) => void;
}

const PhysTile: React.FC<TileProps> = ({ block, isEditMode, onActivate }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={block.label}
      style={{
        ...TILE_BASE,
        borderColor: isEditMode
          ? 'rgba(242,242,242,0.40)'
          : hovered
          ? 'rgba(242,242,242,0.30)'
          : 'rgba(242,242,242,0.10)',
        borderStyle: isEditMode ? 'dashed' : 'solid',
        background: hovered
          ? 'linear-gradient(135deg, rgba(26,26,26,0.92), rgba(38,38,38,0.78))'
          : (TILE_BASE.background as string),
        transform: hovered ? 'translateY(-2px)' : 'none',
        cursor: isEditMode ? 'grab' : 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => !isEditMode && onActivate(block.id)}
      onKeyDown={(e) => {
        if (!isEditMode && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onActivate(block.id);
        }
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '80px',
          height: '80px',
          borderRadius: '0 20px 0 0',
          background: hovered
            ? 'radial-gradient(circle at top right, rgba(242,242,242,0.12), transparent 70%)'
            : 'radial-gradient(circle at top right, rgba(242,242,242,0.04), transparent 70%)',
          transition: 'background 0.25s ease',
          pointerEvents: 'none',
        }}
      />

      <p
        style={{
          fontFamily: 'var(--font-content)',
          fontSize: 'clamp(11px, 0.85vw, 13px)',
          color: 'rgba(242,242,242,0.45)',
          letterSpacing: '0.8px',
          marginBottom: '8px',
          lineHeight: 1.35,
        }}
      >
        {block.sub}
      </p>

      <h3
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(14px, 1.25vw, 22px)',
          color: '#F2F2F2',
          letterSpacing: '2px',
          lineHeight: 1.25,
          fontWeight: 'normal',
          textTransform: 'uppercase',
        }}
      >
        {block.label}
      </h3>
    </div>
  );
};

const CentreTitleBlock: React.FC = () => (
  <div
    aria-label="Physics — subject workspace locked title"
    style={{
      ...TILE_BASE,
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'default',
      borderColor: 'rgba(242,242,242,0.18)',
      background: 'linear-gradient(135deg, rgba(20,20,20,0.95), rgba(10,10,10,0.85))',
    }}
  >
    <h1
      style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 'clamp(24px, 2.6vw, 42px)',
        color: '#F2F2F2',
        letterSpacing: '6px',
        textAlign: 'center',
        fontWeight: 'normal',
      }}
    >
      PHYSICS
    </h1>
  </div>
);

export const PhysicsPage: React.FC = () => {
  const { editModeScreen, setEditModeScreen } = useApp();
  const isEditMode = editModeScreen === 'physics';

  const [activeModal, setActiveModal] = useState<string | null>(null);

  const [layout, setLayout] = useState<BlockLayout[]>(() => {
    const saved = localStorage.getItem('prismate_phys_layout');
    return saved ? JSON.parse(saved) : DEFAULT_PHYS_LAYOUT;
  });

  const draggedBlockId = useRef<string | null>(null);

  const handleDragStart = (id: string) => {
    if (!isEditMode) return;
    draggedBlockId.current = id;
  };

  const handleDrop = (targetId: string) => {
    if (!isEditMode || !draggedBlockId.current || draggedBlockId.current === targetId) return;

    setLayout((prev) => {
      const sourceIdx = prev.findIndex((b) => b.id === draggedBlockId.current);
      const targetIdx = prev.findIndex((b) => b.id === targetId);
      if (sourceIdx === -1 || targetIdx === -1) return prev;

      const next = [...prev];
      const sourceCoord = { gridColumn: next[sourceIdx].gridColumn, gridRow: next[sourceIdx].gridRow };
      const targetCoord = { gridColumn: next[targetIdx].gridColumn, gridRow: next[targetIdx].gridRow };

      next[sourceIdx] = { ...next[sourceIdx], ...targetCoord };
      next[targetIdx] = { ...next[targetIdx], ...sourceCoord };

      localStorage.setItem('prismate_phys_layout', JSON.stringify(next));
      return next;
    });

    draggedBlockId.current = null;
  };

  const getPos = (id: string) => {
    const item = layout.find((b) => b.id === id);
    return item ? { gridColumn: item.gridColumn, gridRow: item.gridRow } : {};
  };

  const physQuestions = INITIAL_QUESTIONS.filter((q) => q.subject === 'physics');

  return (
    <div
      className="prismate-physics-canvas"
      style={{
        width: '100vw',
        height: '100vh',
        background: '#000000',
        position: 'relative',
        overflow: 'hidden',
        color: '#F2F2F2',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{`
        @media (max-aspect-ratio: 4/3), (max-height: 580px) {
          .prismate-physics-canvas {
            overflow-y: auto !important;
          }
          .prismate-physics-grid {
            min-height: 720px !important;
            height: auto !important;
          }
        }
        @media (max-width: 768px) {
          .prismate-physics-grid {
            display: flex !important;
            flex-direction: column !important;
            min-height: auto !important;
          }
          .prismate-physics-grid > div {
            min-height: 120px !important;
          }
        }
      `}</style>

      {/* ── Subject Edit Mode Indicator Banner (§6.1) ────────────────────── */}
      {isEditMode && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 900,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(20,20,20,0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(242,242,242,0.3)',
            borderRadius: '24px',
            padding: '6px 16px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '11px',
              letterSpacing: '1px',
              color: '#F2F2F2',
            }}
          >
            PHYSICS EDIT MODE: DRAG TO REPOSITION (CENTRE LOCKED)
          </span>
          <button
            onClick={() => {
              setLayout(DEFAULT_PHYS_LAYOUT);
              localStorage.removeItem('prismate_phys_layout');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(242,242,242,0.5)',
              fontSize: '10px',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            RESET
          </button>
          <button
            onClick={() => setEditModeScreen(null)}
            style={{
              background: '#F2F2F2',
              color: '#000000',
              border: 'none',
              borderRadius: '12px',
              padding: '4px 10px',
              fontFamily: 'var(--font-heading)',
              fontSize: '10px',
              cursor: 'pointer',
            }}
          >
            DONE
          </button>
        </div>
      )}

      {/* ── Whole-Screen 16x8 Bento Grid ─────────────────────────────────── */}
      <div
        className="prismate-physics-grid"
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(16, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(8, minmax(0, 1fr))',
          gap: '14px',
          padding: '16px',
          boxSizing: 'border-box',
        }}
      >
        {/* Formula Quiz */}
        <div
          style={getPos('formula-quiz')}
          draggable={isEditMode}
          onDragStart={() => handleDragStart('formula-quiz')}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop('formula-quiz')}
        >
          <PhysTile block={PHYS_BLOCKS[0]} isEditMode={isEditMode} onActivate={(id) => setActiveModal(id)} />
        </div>

        {/* Unit Quiz */}
        <div
          style={getPos('unit-quiz')}
          draggable={isEditMode}
          onDragStart={() => handleDragStart('unit-quiz')}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop('unit-quiz')}
        >
          <PhysTile block={PHYS_BLOCKS[1]} isEditMode={isEditMode} onActivate={(id) => setActiveModal(id)} />
        </div>

        {/* PTA Questions */}
        <div
          style={getPos('pta-qp')}
          draggable={isEditMode}
          onDragStart={() => handleDragStart('pta-qp')}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop('pta-qp')}
        >
          <PhysTile block={PHYS_BLOCKS[2]} isEditMode={isEditMode} onActivate={(id) => setActiveModal(id)} />
        </div>

        {/* Locked Centre Title Block — PHYSICS (6×2) */}
        <div style={{ gridColumn: '6 / 12', gridRow: '4 / 6' }}>
          <CentreTitleBlock />
        </div>

        {/* Board Exam QP */}
        <div
          style={getPos('board-qp')}
          draggable={isEditMode}
          onDragStart={() => handleDragStart('board-qp')}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop('board-qp')}
        >
          <PhysTile block={PHYS_BLOCKS[3]} isEditMode={isEditMode} onActivate={(id) => setActiveModal(id)} />
        </div>

        {/* BB One-Word Quiz */}
        <div
          style={getPos('bb-quiz')}
          draggable={isEditMode}
          onDragStart={() => handleDragStart('bb-quiz')}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop('bb-quiz')}
        >
          <PhysTile block={PHYS_BLOCKS[4]} isEditMode={isEditMode} onActivate={(id) => setActiveModal(id)} />
        </div>

        {/* Diagrams */}
        <div
          style={getPos('diagrams')}
          draggable={isEditMode}
          onDragStart={() => handleDragStart('diagrams')}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop('diagrams')}
        >
          <PhysTile block={PHYS_BLOCKS[5]} isEditMode={isEditMode} onActivate={(id) => setActiveModal(id)} />
        </div>
      </div>

      {/* Sub-modals */}
      {activeModal === 'diagrams' && (
        <DiagramsModal subject="physics" onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'pta-qp' && (
        <PapersModal type="pta" subject="Physics" onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'board-qp' && (
        <PapersModal type="board" subject="Physics" onClose={() => setActiveModal(null)} />
      )}

      {(activeModal === 'formula-quiz' || activeModal === 'unit-quiz' || activeModal === 'bb-quiz') && (
        <QuizEngine
          title={`PHYSICS ${activeModal.replace('-', ' ').toUpperCase()}`}
          subject="physics"
          questions={physQuestions}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
};

export default PhysicsPage;
