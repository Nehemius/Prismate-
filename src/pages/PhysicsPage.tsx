import React, { useState, useRef } from 'react';
import DiagramsModal from '../components/DiagramsModal';
import PapersModal from '../components/PapersModal';
import QuizEngine from '../components/QuizEngine';
import {
  getPhysicsBBQuestions,
  getPhysicsFormulaQuestions,
  getPhysicsUnitQuestions,
} from '../data/physicsQuizBank';
import { useApp } from '../context/AppContext';
import GridGuides from '../components/GridGuides';
import BentoEditToolbar from '../components/BentoEditToolbar';
import GlowingTitle from '../components/GlowingTitle';

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
  isTargetHovered?: boolean;
  isDragging?: boolean;
  onActivate: (id: string) => void;
}

const PhysTile: React.FC<TileProps> = ({
  block,
  isEditMode,
  isTargetHovered,
  isDragging,
  onActivate,
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={block.label}
      style={{
        ...TILE_BASE,
        borderColor: isTargetHovered
          ? '#F2F2F2'
          : isEditMode
          ? 'rgba(242,242,242,0.40)'
          : hovered
          ? 'rgba(242,242,242,0.30)'
          : 'rgba(242,242,242,0.10)',
        borderStyle: isTargetHovered ? 'solid' : isEditMode ? 'dashed' : 'solid',
        borderWidth: isTargetHovered ? '2px' : '1px',
        boxShadow: isTargetHovered
          ? '0 0 24px rgba(242,242,242,0.35), inset 0 1px 0 0 rgba(242,242,242,0.3)'
          : TILE_BASE.boxShadow,
        opacity: isDragging ? 0.35 : 1,
        background: hovered
          ? 'linear-gradient(135deg, rgba(26,26,26,0.92), rgba(38,38,38,0.78))'
          : (TILE_BASE.background as string),
        transform: hovered && !isEditMode ? 'translateY(-2px)' : 'none',
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
      {/* Drop Swap Indicator Overlay */}
      {isTargetHovered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.72)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 30,
            pointerEvents: 'none',
            borderRadius: '20px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '11px',
              letterSpacing: '2px',
              color: '#F2F2F2',
              border: '1px solid #F2F2F2',
              padding: '6px 14px',
              borderRadius: '6px',
              background: '#000000',
            }}
          >
            ⇄ DROP TO SWAP
          </span>
        </div>
      )}

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
    <GlowingTitle text="PHYSICS" />
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
  const [dragOverTargetId, setDragOverTargetId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!isEditMode) return;
    draggedBlockId.current = id;
    setActiveDragId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverTargetId !== id) {
      setDragOverTargetId(id);
    }
  };

  const handleDragLeave = (_e: React.DragEvent, id: string) => {
    if (dragOverTargetId === id) {
      setDragOverTargetId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverTargetId(null);
    setActiveDragId(null);
    if (!isEditMode || targetId === 'centre-phys') return;

    const sourceId = e.dataTransfer.getData('text/plain') || draggedBlockId.current;
    if (!sourceId || sourceId === targetId || sourceId === 'centre-phys') return;

    setLayout((prev) => {
      const sourceIdx = prev.findIndex((b) => b.id === sourceId);
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

  // Resize block with bidirectional expansion (§6.1)
  const resizeBlock = (id: string, colDelta: number, rowDelta: number) => {
    setLayout((prev) => {
      const next = prev.map((b) => {
        if (b.id !== id) return b;
        let [cStart, cEnd] = b.gridColumn.split('/').map((s) => parseInt(s.trim()));
        let [rStart, rEnd] = b.gridRow.split('/').map((s) => parseInt(s.trim()));
        if (isNaN(cEnd)) cEnd = cStart + 4;
        if (isNaN(rEnd)) rEnd = rStart + 3;

        let newStartCol = cStart;
        let newEndCol = cEnd + colDelta;
        let newStartRow = rStart;
        let newEndRow = rEnd + rowDelta;

        if (newEndCol > 17) {
          const overflow = newEndCol - 17;
          newEndCol = 17;
          newStartCol = Math.max(1, newStartCol - overflow);
        }
        if (newEndCol - newStartCol < 2) {
          if (colDelta < 0) newEndCol = newStartCol + 2;
        }

        if (newEndRow > 9) {
          const overflow = newEndRow - 9;
          newEndRow = 9;
          newStartRow = Math.max(1, newStartRow - overflow);
        }
        if (newEndRow - newStartRow < 1) {
          newEndRow = newStartRow + 1;
        }

        return {
          ...b,
          gridColumn: `${newStartCol} / ${newEndCol}`,
          gridRow: `${newStartRow} / ${newEndRow}`,
        };
      });
      localStorage.setItem('prismate_phys_layout', JSON.stringify(next));
      return next;
    });
  };

  const moveBlock = (id: string, colShift: number, rowShift: number) => {
    setLayout((prev) => {
      const next = prev.map((b) => {
        if (b.id !== id) return b;
        const [cStart, cEnd] = b.gridColumn.split('/').map((s) => parseInt(s.trim()));
        const [rStart, rEnd] = b.gridRow.split('/').map((s) => parseInt(s.trim()));
        const cSpan = (isNaN(cEnd) ? cStart + 4 : cEnd) - cStart;
        const rSpan = (isNaN(rEnd) ? rStart + 3 : rEnd) - rStart;
        const newStartCol = Math.max(1, Math.min(17 - cSpan, cStart + colShift));
        const newStartRow = Math.max(1, Math.min(9 - rSpan, rStart + rowShift));
        return {
          ...b,
          gridColumn: `${newStartCol} / ${newStartCol + cSpan}`,
          gridRow: `${newStartRow} / ${newStartRow + rSpan}`,
        };
      });
      localStorage.setItem('prismate_phys_layout', JSON.stringify(next));
      return next;
    });
  };

  const handleResetLayout = () => {
    setLayout(DEFAULT_PHYS_LAYOUT);
    localStorage.removeItem('prismate_phys_layout');
  };

  const getPos = (id: string) => {
    const item = layout.find((b) => b.id === id);
    return item ? { gridColumn: item.gridColumn, gridRow: item.gridRow } : {};
  };

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

      {/* ── Edit Workspace Trigger Button (§12 accessible alternative) ── */}
      {!isEditMode && (
        <button
          onClick={() => setEditModeScreen('physics')}
          title="Customize Physics Bento Grid"
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 900,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(15,15,15,0.75)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(242,242,242,0.22)',
            borderRadius: '20px',
            padding: '6px 14px',
            color: 'rgba(242,242,242,0.85)',
            fontFamily: 'var(--font-heading)',
            fontSize: '10px',
            letterSpacing: '1.2px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(242,242,242,0.15)';
            e.currentTarget.style.color = '#F2F2F2';
            e.currentTarget.style.borderColor = 'rgba(242,242,242,0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(15,15,15,0.75)';
            e.currentTarget.style.color = 'rgba(242,242,242,0.85)';
            e.currentTarget.style.borderColor = 'rgba(242,242,242,0.22)';
          }}
        >
          <span>✎</span>
          <span>EDIT WORKSPACE</span>
        </button>
      )}

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
            background: 'rgba(20,20,20,0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(242,242,242,0.3)',
            borderRadius: '24px',
            padding: '6px 16px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.8)',
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
            onClick={handleResetLayout}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(242,242,242,0.5)',
              fontSize: '10px',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontFamily: 'var(--font-subheading)',
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
              padding: '4px 12px',
              fontFamily: 'var(--font-heading)',
              fontSize: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
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
          position: 'relative',
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
        {isEditMode && <GridGuides />}
        {/* Formula Quiz */}
        <div
          style={{ ...getPos('formula-quiz'), position: 'relative' }}
          draggable={isEditMode}
          onDragStart={(e) => handleDragStart(e, 'formula-quiz')}
          onDragOver={(e) => handleDragOver(e, 'formula-quiz')}
          onDragLeave={(e) => handleDragLeave(e, 'formula-quiz')}
          onDrop={(e) => handleDrop(e, 'formula-quiz')}
        >
          {isEditMode && (
            <BentoEditToolbar
              id="formula-quiz"
              label="Formula Quiz"
              gridColumn={layout.find((b) => b.id === 'formula-quiz')?.gridColumn || '1 / 11'}
              gridRow={layout.find((b) => b.id === 'formula-quiz')?.gridRow || '1 / 4'}
              onResize={resizeBlock}
              onMove={moveBlock}
              onDragStart={() => {
                draggedBlockId.current = 'formula-quiz';
                setActiveDragId('formula-quiz');
              }}
            />
          )}
          <PhysTile
            block={PHYS_BLOCKS[0]}
            isEditMode={isEditMode}
            isTargetHovered={dragOverTargetId === 'formula-quiz'}
            isDragging={activeDragId === 'formula-quiz'}
            onActivate={(id) => setActiveModal(id)}
          />
        </div>

        {/* Unit Quiz */}
        <div
          style={{ ...getPos('unit-quiz'), position: 'relative' }}
          draggable={isEditMode}
          onDragStart={(e) => handleDragStart(e, 'unit-quiz')}
          onDragOver={(e) => handleDragOver(e, 'unit-quiz')}
          onDragLeave={(e) => handleDragLeave(e, 'unit-quiz')}
          onDrop={(e) => handleDrop(e, 'unit-quiz')}
        >
          {isEditMode && (
            <BentoEditToolbar
              id="unit-quiz"
              label="Unit Quiz"
              gridColumn={layout.find((b) => b.id === 'unit-quiz')?.gridColumn || '11 / 17'}
              gridRow={layout.find((b) => b.id === 'unit-quiz')?.gridRow || '1 / 4'}
              onResize={resizeBlock}
              onMove={moveBlock}
              onDragStart={() => {
                draggedBlockId.current = 'unit-quiz';
                setActiveDragId('unit-quiz');
              }}
            />
          )}
          <PhysTile
            block={PHYS_BLOCKS[1]}
            isEditMode={isEditMode}
            isTargetHovered={dragOverTargetId === 'unit-quiz'}
            isDragging={activeDragId === 'unit-quiz'}
            onActivate={(id) => setActiveModal(id)}
          />
        </div>

        {/* PTA Questions */}
        <div
          style={{ ...getPos('pta-qp'), position: 'relative' }}
          draggable={isEditMode}
          onDragStart={(e) => handleDragStart(e, 'pta-qp')}
          onDragOver={(e) => handleDragOver(e, 'pta-qp')}
          onDragLeave={(e) => handleDragLeave(e, 'pta-qp')}
          onDrop={(e) => handleDrop(e, 'pta-qp')}
        >
          {isEditMode && (
            <BentoEditToolbar
              id="pta-qp"
              label="PTA Questions"
              gridColumn={layout.find((b) => b.id === 'pta-qp')?.gridColumn || '1 / 6'}
              gridRow={layout.find((b) => b.id === 'pta-qp')?.gridRow || '4 / 6'}
              onResize={resizeBlock}
              onMove={moveBlock}
              onDragStart={() => {
                draggedBlockId.current = 'pta-qp';
                setActiveDragId('pta-qp');
              }}
            />
          )}
          <PhysTile
            block={PHYS_BLOCKS[2]}
            isEditMode={isEditMode}
            isTargetHovered={dragOverTargetId === 'pta-qp'}
            isDragging={activeDragId === 'pta-qp'}
            onActivate={(id) => setActiveModal(id)}
          />
        </div>

        {/* Locked Centre Title Block — PHYSICS (6×2) */}
        <div style={{ gridColumn: '6 / 12', gridRow: '4 / 6', position: 'relative' }}>
          {isEditMode && (
            <BentoEditToolbar
              id="centre-phys"
              label="PHYSICS"
              gridColumn="6 / 12"
              gridRow="4 / 6"
              isLocked={true}
            />
          )}
          <CentreTitleBlock />
        </div>

        {/* Board Exam QP */}
        <div
          style={{ ...getPos('board-qp'), position: 'relative' }}
          draggable={isEditMode}
          onDragStart={(e) => handleDragStart(e, 'board-qp')}
          onDragOver={(e) => handleDragOver(e, 'board-qp')}
          onDragLeave={(e) => handleDragLeave(e, 'board-qp')}
          onDrop={(e) => handleDrop(e, 'board-qp')}
        >
          {isEditMode && (
            <BentoEditToolbar
              id="board-qp"
              label="Board Exam QP"
              gridColumn={layout.find((b) => b.id === 'board-qp')?.gridColumn || '12 / 17'}
              gridRow={layout.find((b) => b.id === 'board-qp')?.gridRow || '4 / 6'}
              onResize={resizeBlock}
              onMove={moveBlock}
              onDragStart={() => {
                draggedBlockId.current = 'board-qp';
                setActiveDragId('board-qp');
              }}
            />
          )}
          <PhysTile
            block={PHYS_BLOCKS[3]}
            isEditMode={isEditMode}
            isTargetHovered={dragOverTargetId === 'board-qp'}
            isDragging={activeDragId === 'board-qp'}
            onActivate={(id) => setActiveModal(id)}
          />
        </div>

        {/* BB One-Word Quiz */}
        <div
          style={{ ...getPos('bb-quiz'), position: 'relative' }}
          draggable={isEditMode}
          onDragStart={(e) => handleDragStart(e, 'bb-quiz')}
          onDragOver={(e) => handleDragOver(e, 'bb-quiz')}
          onDragLeave={(e) => handleDragLeave(e, 'bb-quiz')}
          onDrop={(e) => handleDrop(e, 'bb-quiz')}
        >
          {isEditMode && (
            <BentoEditToolbar
              id="bb-quiz"
              label="BB One-Word Quiz"
              gridColumn={layout.find((b) => b.id === 'bb-quiz')?.gridColumn || '1 / 11'}
              gridRow={layout.find((b) => b.id === 'bb-quiz')?.gridRow || '6 / 9'}
              onResize={resizeBlock}
              onMove={moveBlock}
              onDragStart={() => {
                draggedBlockId.current = 'bb-quiz';
                setActiveDragId('bb-quiz');
              }}
            />
          )}
          <PhysTile
            block={PHYS_BLOCKS[4]}
            isEditMode={isEditMode}
            isTargetHovered={dragOverTargetId === 'bb-quiz'}
            isDragging={activeDragId === 'bb-quiz'}
            onActivate={(id) => setActiveModal(id)}
          />
        </div>

        {/* Diagrams */}
        <div
          style={{ ...getPos('diagrams'), position: 'relative' }}
          draggable={isEditMode}
          onDragStart={(e) => handleDragStart(e, 'diagrams')}
          onDragOver={(e) => handleDragOver(e, 'diagrams')}
          onDragLeave={(e) => handleDragLeave(e, 'diagrams')}
          onDrop={(e) => handleDrop(e, 'diagrams')}
        >
          {isEditMode && (
            <BentoEditToolbar
              id="diagrams"
              label="Diagrams"
              gridColumn={layout.find((b) => b.id === 'diagrams')?.gridColumn || '11 / 17'}
              gridRow={layout.find((b) => b.id === 'diagrams')?.gridRow || '6 / 9'}
              onResize={resizeBlock}
              onMove={moveBlock}
              onDragStart={() => {
                draggedBlockId.current = 'diagrams';
                setActiveDragId('diagrams');
              }}
            />
          )}
          <PhysTile
            block={PHYS_BLOCKS[5]}
            isEditMode={isEditMode}
            isTargetHovered={dragOverTargetId === 'diagrams'}
            isDragging={activeDragId === 'diagrams'}
            onActivate={(id) => setActiveModal(id)}
          />
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
          questions={
            activeModal === 'formula-quiz'
              ? getPhysicsFormulaQuestions()
              : activeModal === 'unit-quiz'
              ? getPhysicsUnitQuestions()
              : getPhysicsBBQuestions()
          }
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
};

export default PhysicsPage;
