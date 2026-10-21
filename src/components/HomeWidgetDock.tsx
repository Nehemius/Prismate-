import React, { useState } from 'react';

export interface StarterWidgetMeta {
  id: string;
  name: string;
  sub: string;
  icon: string;
  defaultColSpan: number;
  defaultRowSpan: number;
}

export const STARTER_WIDGETS: StarterWidgetMeta[] = [
  { id: 'clock', name: 'Cool Time', sub: 'Geometric digital clock', icon: '⏱', defaultColSpan: 4, defaultRowSpan: 3 },
  { id: 'pomodoro', name: 'Pomodoro Timer', sub: 'Configurable study/break intervals', icon: '⏳', defaultColSpan: 4, defaultRowSpan: 3 },
  { id: 'todos', name: 'Quote & Tasks', sub: 'Motivational quote & checklist', icon: '☑', defaultColSpan: 4, defaultRowSpan: 3 },
  { id: 'pulse', name: 'STEM Pulse', sub: 'Daily science fact snippet', icon: '💡', defaultColSpan: 4, defaultRowSpan: 3 },
  { id: 'formula', name: 'Formula Rotator', sub: 'Auto-rotating formula flashcards', icon: '∑', defaultColSpan: 4, defaultRowSpan: 2 },
  { id: 'diagram', name: 'Diagram Rotator', sub: 'Periodic diagram review', icon: '◈', defaultColSpan: 6, defaultRowSpan: 2 },
  { id: 'quiz', name: 'Active Quiz', sub: 'Fast recall question', icon: '⚡', defaultColSpan: 6, defaultRowSpan: 3 },
  { id: 'history', name: 'History Resumption', sub: 'Recently viewed items popup', icon: '↺', defaultColSpan: 5, defaultRowSpan: 3 },
  { id: 'studytube', name: 'Studytube', sub: 'Distraction-free study videos', icon: '▶', defaultColSpan: 5, defaultRowSpan: 3 },
  { id: 'custom_pic', name: 'Custom Picture', sub: 'Upload study diagram/wallpaper (max 1)', icon: '🖼', defaultColSpan: 4, defaultRowSpan: 3 },
];

interface HomeWidgetDockProps {
  activeWidgetIds: string[];
  onAddWidget: (widgetId: string, colSpan: number, rowSpan: number) => void;
  onCloseEditMode: () => void;
  onResetLayout: () => void;
}

export const HomeWidgetDock: React.FC<HomeWidgetDockProps> = ({
  activeWidgetIds,
  onAddWidget,
  onCloseEditMode,
  onResetLayout,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'none',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: collapsed ? 'translateY(calc(100% - 36px))' : 'translateY(0)',
      }}
    >
      {/* Dock Toggle Tab */}
      <div
        onClick={() => setCollapsed((c) => !c)}
        style={{
          pointerEvents: 'auto',
          background: 'rgba(15, 15, 15, 0.95)',
          border: '1px solid rgba(242, 242, 242, 0.25)',
          borderBottom: 'none',
          borderRadius: '12px 12px 0 0',
          padding: '6px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.7)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '11px',
            letterSpacing: '1.5px',
            color: '#F2F2F2',
          }}
        >
          {collapsed ? '▲ OPEN STARTER WIDGET DOCK (10 WIDGETS)' : '▼ HIDE WIDGET DOCK'}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-subheading)',
            fontSize: '10px',
            color: 'rgba(242, 242, 242, 0.5)',
          }}
        >
          {activeWidgetIds.length} on canvas
        </span>
      </div>

      {/* Dock Shelf */}
      <div
        style={{
          pointerEvents: 'auto',
          width: '100%',
          background: 'rgba(12, 12, 12, 0.96)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(242, 242, 242, 0.2)',
          padding: '16px 24px 20px',
          boxSizing: 'border-box',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.8)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '12px',
                letterSpacing: '1.5px',
                color: '#F2F2F2',
              }}
            >
              10 STARTER WIDGETS (§5.2)
            </span>
            <span
              style={{
                fontFamily: 'var(--font-content)',
                fontSize: '11px',
                color: 'rgba(242, 242, 242, 0.45)',
              }}
            >
              Click "+ ADD (2×2)" to place onto the 16 × 8 Bento grid.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onResetLayout}
              style={{
                background: 'transparent',
                border: '1px solid rgba(242, 242, 242, 0.2)',
                color: 'rgba(242, 242, 242, 0.6)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontFamily: 'var(--font-subheading)',
                fontSize: '10px',
                letterSpacing: '1px',
                cursor: 'pointer',
              }}
            >
              RESET SPEC LAYOUT
            </button>
            <button
              onClick={onCloseEditMode}
              style={{
                background: '#F2F2F2',
                border: 'none',
                color: '#000000',
                borderRadius: '6px',
                padding: '4px 14px',
                fontFamily: 'var(--font-heading)',
                fontSize: '11px',
                letterSpacing: '1px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              DONE / SAVE
            </button>
          </div>
        </div>

        {/* Horizontal Widget Carousel */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '6px',
          }}
        >
          {STARTER_WIDGETS.map((w) => {
            const isActive = activeWidgetIds.includes(w.id);
            const isCustomPic = w.id === 'custom_pic';
            const disableAdd = isActive && isCustomPic;

            return (
              <div
                key={w.id}
                draggable={!isActive}
                onDragStart={(e) => {
                  if (!isActive) {
                    e.dataTransfer.setData('text/plain', `new:${w.id}`);
                    e.dataTransfer.effectAllowed = 'copy';
                    // Grabbing a widget makes the dock slide down per §5.1
                    setCollapsed(true);
                  }
                }}
                style={{
                  minWidth: '170px',
                  maxWidth: '180px',
                  background: isActive ? 'rgba(242, 242, 242, 0.05)' : 'rgba(25, 25, 25, 0.8)',
                  border: isActive
                    ? '1px solid rgba(242, 242, 242, 0.15)'
                    : '1px solid rgba(242, 242, 242, 0.3)',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box',
                  cursor: isActive ? 'default' : 'grab',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px' }}>{w.icon}</span>
                    <span
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '11px',
                        color: '#F2F2F2',
                        letterSpacing: '0.5px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {w.name}
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-content)',
                      fontSize: '10px',
                      color: 'rgba(242, 242, 242, 0.45)',
                      lineHeight: 1.3,
                      margin: '0 0 10px',
                      minHeight: '26px',
                    }}
                  >
                    {w.sub}
                  </p>
                </div>

                {isActive ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(242, 242, 242, 0.08)',
                      border: '1px solid rgba(242, 242, 242, 0.12)',
                      borderRadius: '6px',
                      padding: '4px',
                      fontFamily: 'var(--font-subheading)',
                      fontSize: '9px',
                      color: 'rgba(242, 242, 242, 0.5)',
                      letterSpacing: '0.8px',
                    }}
                  >
                    ✓ ON CANVAS
                  </div>
                ) : (
                  <button
                    onClick={() => onAddWidget(w.id, 2, 2)}
                    disabled={disableAdd}
                    style={{
                      background: '#F2F2F2',
                      border: 'none',
                      color: '#000000',
                      borderRadius: '6px',
                      padding: '5px 8px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '10px',
                      letterSpacing: '1px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    + ADD (2×2)
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomeWidgetDock;
