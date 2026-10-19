import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_REACTIONS, INITIAL_DIAGRAMS, INITIAL_QUESTIONS } from '../data/mockData';

/**
 * HomePage / "You" — Customizable 16 x 8 Bento Canvas
 *
 * SPECIFICATION & CORRECTIONS:
 *   - Bento grid occupies 100% of screen width and height (full screen, edge-to-edge).
 *   - Drag & Swap Repositioning Engine (§5.1):
 *       * When Edit Mode is active (triggered via Nav long-press/right-click), tiles are draggable.
 *       * Dropping on another tile swaps coordinates. Layout persists in localStorage.
 *   - All AI "slop" stripped: no redundant title banners, no filler lines.
 *   - Studytube: Distraction-free video lesson player modal.
 *   - Custom Picture: Upload custom motivational image via file picker.
 */

interface WidgetLayout {
  id: string;
  gridColumn: string;
  gridRow: string;
}

const DEFAULT_HOME_LAYOUT: WidgetLayout[] = [
  { id: 'clock', gridColumn: '1 / 5', gridRow: '1 / 4' },
  { id: 'pomodoro', gridColumn: '5 / 9', gridRow: '1 / 4' },
  { id: 'todos', gridColumn: '9 / 13', gridRow: '1 / 4' },
  { id: 'pulse', gridColumn: '13 / 17', gridRow: '1 / 4' },
  { id: 'formula', gridColumn: '1 / 5', gridRow: '4 / 6' },
  { id: 'welcome', gridColumn: '5 / 11', gridRow: '4 / 6' },
  { id: 'diagram', gridColumn: '11 / 17', gridRow: '4 / 6' },
  { id: 'quiz', gridColumn: '1 / 7', gridRow: '6 / 9' },
  { id: 'history', gridColumn: '7 / 12', gridRow: '6 / 9' },
  { id: 'studytube', gridColumn: '12 / 17', gridRow: '6 / 9' },
];

const TILE_BASE: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(16,16,16,0.85), rgba(28,28,28,0.72))',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'rgba(242,242,242,0.10)',
  borderRadius: '20px',
  boxShadow: 'inset 0 1px 0 0 rgba(242,242,242,0.22)',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column' as const,
  position: 'relative' as const,
  overflow: 'hidden' as const,
  boxSizing: 'border-box' as const,
  width: '100%',
  height: '100%',
  transition: 'border-color 0.2s ease, background 0.2s ease',
};

export const HomePage: React.FC = () => {
  const { loggedInUser, userAvatar, editModeScreen, setEditModeScreen } = useApp();
  const isEditMode = editModeScreen === 'home';

  // Dynamic layout state with LocalStorage persistence (§5.1)
  const [layout, setLayout] = useState<WidgetLayout[]>(() => {
    const saved = localStorage.getItem('prismate_home_widget_layout');
    return saved ? JSON.parse(saved) : DEFAULT_HOME_LAYOUT;
  });

  const draggedWidgetId = useRef<string | null>(null);

  // Clock state
  const [currentTime, setCurrentTime] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Pomodoro timer state
  const [pomoSeconds, setPomoSeconds] = useState(25 * 60);
  const [pomoRunning, setPomoRunning] = useState(false);
  useEffect(() => {
    if (!pomoRunning) return;
    const t = setInterval(() => {
      setPomoSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [pomoRunning]);

  // Rotator states
  const [formulaIdx, setFormulaIdx] = useState(0);
  const [diagIdx, setDiagIdx] = useState(0);

  // Checklist
  const [todos, setTodos] = useState([
    { id: 't1', text: 'Cannizzaro Disproportionation Mechanism', done: true },
    { id: 't2', text: 'PTA Chemistry Paper 1 Revision', done: false },
    { id: 't3', text: 'Galvanic Cell EMF Calculation Drills', done: false },
  ]);

  // Active quiz flash state
  const [activeQuizAnswered, setActiveQuizAnswered] = useState<number | null>(null);

  // Studytube video modal state (§5.2)
  const [studyVideoOpen, setStudyVideoOpen] = useState(false);

  // Custom Picture upload state (§5.2)
  const [customPictureUrl, setCustomPictureUrl] = useState<string | null>(() => {
    return localStorage.getItem('prismate_custom_picture') || null;
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCustomPictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setCustomPictureUrl(url);
        localStorage.setItem('prismate_custom_picture', url);
      };
      reader.readAsDataURL(file);
    }
  };

  const formulas = [
    { name: 'Nernst Equation', eq: 'E = E° - (0.0591/n) log Q' },
    { name: 'Bragg’s Law', eq: '2d sin θ = nλ' },
    { name: 'Arrhenius Rate Law', eq: 'k = A · e^(-Ea / RT)' },
    { name: 'Bohr Radius', eq: 'r_n = 0.529 · (n² / Z) Å' },
  ];

  const currentFormula = formulas[formulaIdx];
  const currentDiagram = INITIAL_DIAGRAMS[diagIdx] || INITIAL_DIAGRAMS[0];

  // Drag & Swap handlers (§5.1)
  const handleDragStart = (id: string) => {
    if (!isEditMode) return;
    draggedWidgetId.current = id;
  };

  const handleDrop = (targetId: string) => {
    if (!isEditMode || !draggedWidgetId.current || draggedWidgetId.current === targetId) return;

    setLayout((prev) => {
      const sourceIdx = prev.findIndex((w) => w.id === draggedWidgetId.current);
      const targetIdx = prev.findIndex((w) => w.id === targetId);
      if (sourceIdx === -1 || targetIdx === -1) return prev;

      const next = [...prev];
      const sourceCoord = { gridColumn: next[sourceIdx].gridColumn, gridRow: next[sourceIdx].gridRow };
      const targetCoord = { gridColumn: next[targetIdx].gridColumn, gridRow: next[targetIdx].gridRow };

      next[sourceIdx] = { ...next[sourceIdx], ...targetCoord };
      next[targetIdx] = { ...next[targetIdx], ...sourceCoord };

      localStorage.setItem('prismate_home_widget_layout', JSON.stringify(next));
      return next;
    });

    draggedWidgetId.current = null;
  };

  const getWidgetPos = (id: string) => {
    const item = layout.find((w) => w.id === id);
    return item ? { gridColumn: item.gridColumn, gridRow: item.gridRow } : {};
  };

  const tileStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
    ...TILE_BASE,
    borderColor: isEditMode ? 'rgba(242,242,242,0.40)' : TILE_BASE.borderColor,
    borderStyle: isEditMode ? 'dashed' : 'solid',
    cursor: isEditMode ? 'grab' : 'default',
    ...extra,
  });

  return (
    <div
      className="prismate-home-canvas"
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
          .prismate-home-canvas {
            overflow-y: auto !important;
          }
          .prismate-home-grid {
            min-height: 840px !important;
            height: auto !important;
          }
        }
        @media (max-width: 768px) {
          .prismate-home-grid {
            display: flex !important;
            flex-direction: column !important;
            min-height: auto !important;
          }
          .prismate-home-grid > div {
            min-height: 140px !important;
          }
        }
      `}</style>

      {/* ── Edit Mode Floating Indicator Banner ──────────────────────────── */}
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
            EDIT MODE: DRAG TILES TO REPOSITION
          </span>
          <button
            onClick={() => {
              setLayout(DEFAULT_HOME_LAYOUT);
              localStorage.removeItem('prismate_home_widget_layout');
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

      {/* Hidden file picker for custom picture upload (§5.2) */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleCustomPictureUpload}
      />

      {/* ── Whole-Screen 16 × 8 Bento Canvas (100% width/height edge-to-edge) */}
      <div
        className="prismate-home-grid"
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
        {/* 1. Geometric Clock (Clean, no redundant title banner) */}
        <div
          style={getWidgetPos('clock')}
          draggable={isEditMode}
          onDragStart={() => handleDragStart('clock')}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop('clock')}
        >
          <div style={tileStyle({ justifyContent: 'center', alignItems: 'center' })}>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(30px, 2.6vw, 44px)',
                letterSpacing: '3px',
                margin: 0,
                lineHeight: 1,
              }}
            >
              {currentTime.toLocaleTimeString([], { hour12: false })}
            </h2>
            <span
              style={{
                fontFamily: 'var(--font-content)',
                fontSize: '12px',
                color: 'rgba(242,242,242,0.45)',
                marginTop: '10px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* 2. Pomodoro Timer (Functional, no redundant title banner) */}
        <div
          style={getWidgetPos('pomodoro')}
          draggable={isEditMode}
          onDragStart={() => handleDragStart('pomodoro')}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop('pomodoro')}
        >
          <div style={tileStyle({ justifyContent: 'center', alignItems: 'center', gap: '16px' })}>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(28px, 2.4vw, 40px)',
                letterSpacing: '3px',
                margin: 0,
                lineHeight: 1,
              }}
            >
              {Math.floor(pomoSeconds / 60).toString().padStart(2, '0')}:{(pomoSeconds % 60).toString().padStart(2, '0')}
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setPomoRunning((r) => !r)}
                style={{
                  background: pomoRunning ? 'rgba(242,242,242,0.1)' : '#F2F2F2',
                  color: pomoRunning ? '#F2F2F2' : '#000000',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  letterSpacing: '1px',
                }}
              >
                {pomoRunning ? 'PAUSE' : 'START'}
              </button>
              <button
                onClick={() => {
                  setPomoRunning(false);
                  setPomoSeconds(25 * 60);
                }}
                style={{
                  background: 'transparent',
                  color: '#F2F2F2',
                  border: '1px solid rgba(242,242,242,0.2)',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  letterSpacing: '1px',
                }}
              >
                RESET
              </button>
            </div>
          </div>
        </div>

        {/* 3. Daily Checklist (Pure functional tasks) */}
        <div
          style={getWidgetPos('todos')}
          draggable={isEditMode}
          onDragStart={() => handleDragStart('todos')}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop('todos')}
        >
          <div style={tileStyle({ justifyContent: 'center', overflowY: 'auto' })}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  onClick={() =>
                    setTodos((list) =>
                      list.map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t))
                    )
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontFamily: 'var(--font-content)',
                    fontSize: '13px',
                    color: todo.done ? 'rgba(242,242,242,0.30)' : '#F2F2F2',
                    textDecoration: todo.done ? 'line-through' : 'none',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <span
                    style={{
                      fontSize: '14px',
                      color: todo.done ? '#F2F2F2' : 'rgba(242,242,242,0.4)',
                    }}
                  >
                    {todo.done ? '☑' : '☐'}
                  </span>
                  <span>{todo.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Daily STEM Insight (Clean quote/insight) */}
        <div
          style={getWidgetPos('pulse')}
          draggable={isEditMode}
          onDragStart={() => handleDragStart('pulse')}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop('pulse')}
        >
          <div style={tileStyle({ justifyContent: 'center' })}>
            <p
              style={{
                fontFamily: 'var(--font-content)',
                fontSize: 'clamp(12px, 0.95vw, 14px)',
                lineHeight: 1.6,
                color: 'rgba(242,242,242,0.85)',
                margin: 0,
                fontStyle: 'italic',
              }}
            >
              "Supercritical CO₂ acts as both gas and liquid simultaneously — currently replacing toxic organic solvents in modern green chemistry decaffeination."
            </p>
          </div>
        </div>

        {/* 5. Formula Rotator (Clean mathematical display) */}
        <div
          style={getWidgetPos('formula')}
          draggable={isEditMode}
          onDragStart={() => handleDragStart('formula')}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop('formula')}
        >
          <div
            style={tileStyle({
              cursor: isEditMode ? 'grab' : 'pointer',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            })}
            onClick={() => !isEditMode && setFormulaIdx((i) => (i + 1) % formulas.length)}
          >
            <h4
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '14px',
                color: 'rgba(242,242,242,0.6)',
                margin: '0 0 6px',
                letterSpacing: '1px',
              }}
            >
              {currentFormula.name}
            </h4>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '15px',
                color: '#F2F2F2',
                background: 'rgba(0,0,0,0.4)',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(242,242,242,0.1)',
                display: 'inline-block',
              }}
            >
              {currentFormula.eq}
            </div>
          </div>
        </div>

        {/* 6. CENTRE WELCOME BLOCK (4 × 2 units per §5.1) */}
        <div
          style={getWidgetPos('welcome')}
          draggable={isEditMode}
          onDragStart={() => handleDragStart('welcome')}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop('welcome')}
        >
          <div
            style={tileStyle({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              background: 'linear-gradient(135deg, rgba(22,22,22,0.95), rgba(12,12,12,0.88))',
              borderColor: 'rgba(242,242,242,0.22)',
            })}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#F2F2F2',
                color: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-heading)',
                fontSize: '22px',
                flexShrink: 0,
              }}
            >
              {userAvatar || (loggedInUser ? loggedInUser[0] : 'U')}
            </div>
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(20px, 2vw, 28px)',
                  letterSpacing: '3px',
                  margin: 0,
                  color: '#F2F2F2',
                }}
              >
                WELCOME, {loggedInUser?.toUpperCase()}
              </h2>
            </div>
          </div>
        </div>

        {/* 7. Diagram Rotator (Clean visual diagram) */}
        <div
          style={getWidgetPos('diagram')}
          draggable={isEditMode}
          onDragStart={() => handleDragStart('diagram')}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop('diagram')}
        >
          <div
            style={tileStyle({
              cursor: isEditMode ? 'grab' : 'pointer',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            })}
            onClick={() => !isEditMode && setDiagIdx((i) => (i + 1) % INITIAL_DIAGRAMS.length)}
          >
            <h4
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '15px',
                letterSpacing: '2px',
                color: '#F2F2F2',
                margin: '0 0 4px',
              }}
            >
              {currentDiagram.title}
            </h4>
            <span
              style={{
                fontFamily: 'var(--font-content)',
                fontSize: '12px',
                color: 'rgba(242,242,242,0.45)',
              }}
            >
              {currentDiagram.chapter}
            </span>
          </div>
        </div>

        {/* 8. Active Quiz Flash (Functional question & options) */}
        <div
          style={getWidgetPos('quiz')}
          draggable={isEditMode}
          onDragStart={() => handleDragStart('quiz')}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop('quiz')}
        >
          <div style={tileStyle({ justifyContent: 'center' })}>
            <p
              style={{
                fontFamily: 'var(--font-content)',
                fontSize: '13px',
                margin: '0 0 12px',
                lineHeight: 1.45,
                color: '#F2F2F2',
              }}
            >
              {INITIAL_QUESTIONS[0].question}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {INITIAL_QUESTIONS[0].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveQuizAnswered(idx)}
                  style={{
                    background:
                      activeQuizAnswered === idx
                        ? idx === INITIAL_QUESTIONS[0].correctIndex
                          ? '#F2F2F2'
                          : '#EB104B'
                        : 'rgba(242,242,242,0.06)',
                    color: activeQuizAnswered === idx && idx === INITIAL_QUESTIONS[0].correctIndex ? '#000000' : '#F2F2F2',
                    border: '1px solid rgba(242,242,242,0.15)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontFamily: 'var(--font-content)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 9. History Widget (Clean item list) */}
        <div
          style={getWidgetPos('history')}
          draggable={isEditMode}
          onDragStart={() => handleDragStart('history')}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop('history')}
        >
          <div style={tileStyle({ justifyContent: 'center', overflowY: 'auto' })}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {INITIAL_REACTIONS.slice(0, 3).map((r) => (
                <div key={r.id}>
                  <span
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '12px',
                      letterSpacing: '1px',
                      display: 'block',
                      color: '#F2F2F2',
                    }}
                  >
                    {r.name}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-content)',
                      fontSize: '11px',
                      color: 'rgba(242,242,242,0.4)',
                    }}
                  >
                    {r.chapter}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 10. Studytube / Focus Player (§5.2) */}
        <div
          style={getWidgetPos('studytube')}
          draggable={isEditMode}
          onDragStart={() => handleDragStart('studytube')}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop('studytube')}
        >
          <div
            onClick={() => !isEditMode && setStudyVideoOpen(true)}
            style={tileStyle({
              justifyContent: 'center',
              alignItems: 'center',
              background: customPictureUrl
                ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${customPictureUrl}) center/cover`
                : 'rgba(10,10,10,0.95)',
              cursor: isEditMode ? 'grab' : 'pointer',
            })}
          >
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '13px',
                letterSpacing: '2px',
                color: 'rgba(242,242,242,0.8)',
              }}
            >
              ▶ PLAY: TN CHEMISTRY LECTURES
            </span>
            <span
              style={{
                fontFamily: 'var(--font-content)',
                fontSize: '10px',
                color: 'rgba(242,242,242,0.4)',
                marginTop: '6px',
              }}
            >
              Click for distraction-free study stream
            </span>
          </div>
        </div>
      </div>

      {/* ── Studytube Distraction-Free Modal (§5.2) ───────────────────────── */}
      {studyVideoOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setStudyVideoOpen(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9500,
            background: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            style={{
              width: 'min(900px, 92vw)',
              background: '#0a0a0a',
              border: '1px solid rgba(242,242,242,0.2)',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px',
                borderBottom: '1px solid rgba(242,242,242,0.1)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '14px',
                  letterSpacing: '2px',
                  color: '#F2F2F2',
                }}
              >
                STUDYTUBE • DISTRACTION-FREE LECTURE
              </span>
              <button
                onClick={() => setStudyVideoOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#F2F2F2',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
            {/* Embedded Clean Video Player Container */}
            <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', background: '#000000' }}>
              <iframe
                title="TN Chemistry Video Lesson"
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0&modestbranding=1"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
