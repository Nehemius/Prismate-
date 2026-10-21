import React from 'react';

/**
 * GridGuides — 16 × 8 Bento Grid Blueprint Overlay
 *
 * SPECIFICATION (PRISMATE_UI_SPEC.md §5.1, §6.1):
 *   - Exposed during Edit Mode to guide widget placement and resizing.
 *   - Renders faint, non-interactive cell outlines across 16 columns × 8 rows.
 */
const GUIDE_CELLS = Array.from({ length: 16 * 8 }, (_, i) => ({
  id: i,
  col: (i % 16) + 1,
  row: Math.floor(i / 16) + 1,
}));

export const GridGuides: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(16, minmax(0, 1fr))',
        gridTemplateRows: 'repeat(8, minmax(0, 1fr))',
        gap: '14px',
        padding: '16px',
        pointerEvents: 'none',
        zIndex: 2,
        boxSizing: 'border-box',
      }}
    >
      {GUIDE_CELLS.map((cell) => (
        <div
          key={cell.id}
          style={{
            border: '1px dashed rgba(242, 242, 242, 0.08)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            padding: '4px 6px',
            color: 'rgba(242, 242, 242, 0.15)',
            fontFamily: 'var(--font-heading)',
            fontSize: '8px',
            letterSpacing: '0.5px',
            userSelect: 'none',
          }}
        >
          {cell.col},{cell.row}
        </div>
      ))}
    </div>
  );
};

export default GridGuides;
