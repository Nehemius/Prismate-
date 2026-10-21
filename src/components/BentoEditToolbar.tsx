import React from 'react';

export interface BentoEditToolbarProps {
  id: string;
  label: string;
  gridColumn: string;
  gridRow: string;
  onResize?: (id: string, colDelta: number, rowDelta: number) => void;
  onMove?: (id: string, colShift: number, rowShift: number) => void;
  onRemove?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDragStart?: (id: string) => void;
  isLocked?: boolean;
}

export const BentoEditToolbar: React.FC<BentoEditToolbarProps> = ({
  id,
  label,
  gridColumn,
  gridRow,
  onResize,
  onMove,
  onRemove,
  onEdit,
  onDragStart,
  isLocked = false,
}) => {
  const [cStart, cEnd] = gridColumn.split('/').map((s) => parseInt(s.trim(), 10));
  const [rStart, rEnd] = gridRow.split('/').map((s) => parseInt(s.trim(), 10));
  const colSpan = (isNaN(cEnd) ? 4 : cEnd) - (isNaN(cStart) ? 1 : cStart);
  const rowSpan = (isNaN(rEnd) ? 3 : rEnd) - (isNaN(rStart) ? 1 : rStart);

  if (isLocked) {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          background: 'rgba(10, 10, 10, 0.92)',
          borderBottom: '1px solid rgba(242, 242, 242, 0.2)',
          padding: '4px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 20,
          pointerEvents: 'auto',
          borderRadius: '18px 18px 0 0',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '9px',
            letterSpacing: '1px',
            color: 'rgba(242, 242, 242, 0.6)',
          }}
        >
          🔒 LOCKED CENTRE BLOCK ({colSpan} × {rowSpan})
        </span>
        <span
          style={{
            fontFamily: 'var(--font-subheading)',
            fontSize: '9px',
            letterSpacing: '0.5px',
            color: 'rgba(242, 242, 242, 0.4)',
          }}
        >
          IMMUTABLE
        </span>
      </div>
    );
  }

  const btnStyle: React.CSSProperties = {
    background: 'rgba(242, 242, 242, 0.12)',
    border: '1px solid rgba(242, 242, 242, 0.25)',
    color: '#F2F2F2',
    borderRadius: '4px',
    padding: '2px 6px',
    fontSize: '10px',
    fontFamily: 'var(--font-heading)',
    cursor: 'pointer',
    lineHeight: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(12, 12, 12, 0.94)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(242, 242, 242, 0.2)',
        padding: '5px 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '6px',
        zIndex: 25,
        pointerEvents: 'auto',
        borderRadius: '18px 18px 0 0',
      }}
    >
      {/* Title & Span Info + Drag Handle */}
      <div
        draggable
        onDragStart={(e) => {
          e.stopPropagation();
          e.dataTransfer.setData('text/plain', id);
          e.dataTransfer.effectAllowed = 'move';
          onDragStart?.(id);
        }}
        title="Drag by handle or tile to swap positions"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'grab',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '10px',
            letterSpacing: '0.8px',
            color: '#F2F2F2',
          }}
        >
          ⠿ {label}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-subheading)',
            fontSize: '9px',
            color: 'rgba(242, 242, 242, 0.55)',
            letterSpacing: '0.5px',
          }}
        >
          [{colSpan}×{rowSpan}]
        </span>
      </div>

      {/* Resize & Move Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Width (Column span) */}
        {onResize && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <span style={{ fontSize: '9px', color: 'rgba(242,242,242,0.4)', marginRight: '2px' }}>W</span>
            <button
              title="Narrower (shrink column span)"
              style={btnStyle}
              onClick={() => onResize(id, -1, 0)}
              disabled={colSpan <= 2}
            >
              −
            </button>
            <button
              title="Wider (expand column span)"
              style={btnStyle}
              onClick={() => onResize(id, 1, 0)}
              disabled={cStart <= 1 && cEnd >= 17}
            >
              +
            </button>
          </div>
        )}

        {/* Height (Row span) */}
        {onResize && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <span style={{ fontSize: '9px', color: 'rgba(242,242,242,0.4)', marginRight: '2px' }}>H</span>
            <button
              title="Shorter (shrink row span)"
              style={btnStyle}
              onClick={() => onResize(id, 0, -1)}
              disabled={rowSpan <= 1}
            >
              −
            </button>
            <button
              title="Taller (expand row span)"
              style={btnStyle}
              onClick={() => onResize(id, 0, 1)}
              disabled={rStart <= 1 && rEnd >= 9}
            >
              +
            </button>
          </div>
        )}

        {/* Move arrows */}
        {onMove && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <button title="Shift Left" style={btnStyle} onClick={() => onMove(id, -1, 0)} disabled={cStart <= 1}>
              ◀
            </button>
            <button title="Shift Right" style={btnStyle} onClick={() => onMove(id, 1, 0)} disabled={cEnd >= 17}>
              ▶
            </button>
            <button title="Shift Up" style={btnStyle} onClick={() => onMove(id, 0, -1)} disabled={rStart <= 1}>
              ▲
            </button>
            <button title="Shift Down" style={btnStyle} onClick={() => onMove(id, 0, 1)} disabled={rEnd >= 9}>
              ▼
            </button>
          </div>
        )}

        {/* Edit button */}
        {onEdit && (
          <button
            title="Edit widget settings"
            onClick={() => onEdit(id)}
            style={{
              ...btnStyle,
              background: 'rgba(51, 240, 255, 0.15)',
              borderColor: 'rgba(51, 240, 255, 0.4)',
              color: '#33F0FF',
              marginLeft: '4px',
            }}
          >
            ✎
          </button>
        )}

        {/* Remove button (Home widgets only) */}
        {onRemove && (
          <button
            title="Remove from canvas back to Starter Dock"
            onClick={() => onRemove(id)}
            style={{
              ...btnStyle,
              background: 'rgba(242, 242, 242, 0.12)',
              borderColor: 'rgba(242, 242, 242, 0.35)',
              color: '#F2F2F2',
              marginLeft: '4px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(242, 242, 242, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(242, 242, 242, 0.12)';
            }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default BentoEditToolbar;
