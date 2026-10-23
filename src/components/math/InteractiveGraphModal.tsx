import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/useApp';

interface InteractiveGraphModalProps {
  onClose: () => void;
}

type GraphMode = 'function' | 'table';

interface PresetEquation {
  name: string;
  category: string;
  fnStr: string;
  fn: (x: number) => number | null;
  xRange: [number, number];
  yRange: [number, number];
  description: string;
}

const PRESET_EQUATIONS: PresetEquation[] = [
  {
    name: 'Parabola: y² = 4ax (Open Right)',
    category: 'Conics (§5.2)',
    fnStr: 'y = ±2√(x)',
    fn: (x: number) => (x >= 0 ? 2 * Math.sqrt(x) : null),
    xRange: [-2, 8],
    yRange: [-6, 6],
    description: 'Standard parabola with vertex at (0,0), focus at (1,0), directrix x = -1.',
  },
  {
    name: 'Ellipse: x²/16 + y²/9 = 1',
    category: 'Conics (§5.3)',
    fnStr: 'y = ±3√(1 - x²/16)',
    fn: (x: number) => (Math.abs(x) <= 4 ? 3 * Math.sqrt(Math.max(0, 1 - (x * x) / 16)) : null),
    xRange: [-6, 6],
    yRange: [-5, 5],
    description: 'Major axis 2a = 8 along X, minor axis 2b = 6 along Y, eccentricity e = √7 / 4.',
  },
  {
    name: 'Rectangular Hyperbola: xy = 4',
    category: 'Conics (§5.4)',
    fnStr: 'y = 4 / x',
    fn: (x: number) => (Math.abs(x) > 0.1 ? 4 / x : null),
    xRange: [-8, 8],
    yRange: [-8, 8],
    description: 'Asymptotes are the coordinate axes x = 0 and y = 0. Eccentricity e = √2.',
  },
  {
    name: 'Sine Wave: y = sin(x)',
    category: 'Trigonometry',
    fnStr: 'y = sin(x)',
    fn: (x: number) => Math.sin(x),
    xRange: [-7, 7],
    yRange: [-2, 2],
    description: 'Periodic sinusoidal wave with period 2π, amplitude 1.',
  },
  {
    name: 'Cubic Polynomial: y = x³ - 3x',
    category: 'Calculus (§7.1)',
    fnStr: 'y = x³ - 3x',
    fn: (x: number) => x * x * x - 3 * x,
    xRange: [-3, 3],
    yRange: [-4, 4],
    description: 'Local maximum at (-1, 2), local minimum at (1, -2), inflection point at (0, 0).',
  },
  {
    name: 'Exponential: y = e^x',
    category: 'Calculus (§7.4)',
    fnStr: 'y = e^x',
    fn: (x: number) => Math.exp(x),
    xRange: [-4, 3],
    yRange: [-1, 12],
    description: 'Strictly increasing growth function passing through (0,1) with horizontal asymptote y = 0.',
  },
];

export const InteractiveGraphModal: React.FC<InteractiveGraphModalProps> = ({ onClose }) => {
  const { theme } = useApp();
  const isLight = theme === 'light';

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [mode, setMode] = useState<GraphMode>('function');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [customEquationInput, setCustomEquationInput] = useState<string>('x * Math.sin(x)');
  const [useCustomEquation, setUseCustomEquation] = useState<boolean>(false);

  // Table Coordinates Input
  const [tablePointsText, setTablePointsText] = useState<string>(
    '(-4, 16)\n(-3, 9)\n(-2, 4)\n(-1, 1)\n(0, 0)\n(1, 1)\n(2, 4)\n(3, 9)\n(4, 16)'
  );

  // Animation Progress: 0 to 1
  const [growthProgress, setGrowthProgress] = useState<number>(1);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Current active equation
  const activePreset = PRESET_EQUATIONS[selectedPresetIndex];

  // Parse points from table input
  const parsedTablePoints = useCallback((): { x: number; y: number }[] => {
    const lines = tablePointsText.split('\n');
    const pts: { x: number; y: number }[] = [];
    for (const line of lines) {
      const match = line.match(/\(?\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*\)?/);
      if (match) {
        pts.push({ x: parseFloat(match[1]), y: parseFloat(match[2]) });
      }
    }
    return pts.sort((a, b) => a.x - b.x);
  }, [tablePointsText]);

  // Trigger Animation
  const startGraphGrowth = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsAnimating(true);
    setGrowthProgress(0);
    startTimeRef.current = performance.now();

    const duration = 1600; // 1.6s smooth growth

    const step = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setGrowthProgress(eased);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        setIsAnimating(false);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    startGraphGrowth();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [mode, selectedPresetIndex, useCustomEquation]);

  // Render Canvas Graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = isLight ? '#FFFFFF' : '#0E1118';
    ctx.fillRect(0, 0, width, height);

    // Coordinate Bounds
    let xMin = activePreset.xRange[0];
    let xMax = activePreset.xRange[1];
    let yMin = activePreset.yRange[0];
    let yMax = activePreset.yRange[1];

    if (mode === 'table') {
      const pts = parsedTablePoints();
      if (pts.length > 0) {
        const xs = pts.map((p) => p.x);
        const ys = pts.map((p) => p.y);
        xMin = Math.min(...xs) - 1.5;
        xMax = Math.max(...xs) + 1.5;
        yMin = Math.min(...ys) - 2;
        yMax = Math.max(...ys) + 2;
      }
    }

    const margin = 50;
    const plotWidth = width - margin * 2;
    const plotHeight = height - margin * 2;

    const toScreenX = (x: number) => margin + ((x - xMin) / (xMax - xMin)) * plotWidth;
    const toScreenY = (y: number) => height - margin - ((y - yMin) / (yMax - yMin)) * plotHeight;

    // Draw Grid Lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.06)';

    // Vertical grid
    const xStep = Math.max(1, Math.round((xMax - xMin) / 10));
    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += xStep) {
      const sx = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(sx, margin);
      ctx.lineTo(sx, height - margin);
      ctx.stroke();

      // Number label
      ctx.fillStyle = isLight ? '#6B7280' : 'rgba(242, 242, 242, 0.4)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(x.toString(), sx, height - margin + 16);
    }

    // Horizontal grid
    const yStep = Math.max(1, Math.round((yMax - yMin) / 10));
    for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y += yStep) {
      const sy = toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(margin, sy);
      ctx.lineTo(width - margin, sy);
      ctx.stroke();

      // Number label
      ctx.fillStyle = isLight ? '#6B7280' : 'rgba(242, 242, 242, 0.4)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(y.toString(), margin - 8, sy + 3);
    }

    // Coordinate Axes (X = 0 and Y = 0)
    const originX = toScreenX(0);
    const originY = toScreenY(0);

    ctx.lineWidth = 2;
    ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.4)' : 'rgba(242, 242, 242, 0.5)';

    // X-axis
    if (originY >= margin && originY <= height - margin) {
      ctx.beginPath();
      ctx.moveTo(margin, originY);
      ctx.lineTo(width - margin, originY);
      ctx.stroke();
    }

    // Y-axis
    if (originX >= margin && originX <= width - margin) {
      ctx.beginPath();
      ctx.moveTo(originX, margin);
      ctx.lineTo(originX, height - margin);
      ctx.stroke();
    }

    // Axis Labels
    ctx.font = 'bold 12px var(--font-heading), sans-serif';
    ctx.fillStyle = isLight ? '#111827' : '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.fillText('X →', width - margin + 8, originY >= margin && originY <= height - margin ? originY + 4 : height - margin);
    ctx.textAlign = 'center';
    ctx.fillText('Y ↑', originX >= margin && originX <= width - margin ? originX : margin, margin - 12);

    // ── PLOT CURVE WITH ANIMATED GROWTH ──
    const strokeColor = isLight ? '#0077EE' : '#38BDF8';
    ctx.lineWidth = 3;
    ctx.strokeStyle = strokeColor;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    let tracerPoint: { x: number; y: number } | null = null;

    if (mode === 'function') {
      const totalSteps = 400;
      const activeSteps = Math.floor(totalSteps * growthProgress);

      const evaluateFn = (x: number): number | null => {
        if (useCustomEquation) {
          try {
            // eslint-disable-next-line no-new-func
            const f = new Function('x', `return ${customEquationInput};`);
            const res = f(x);
            return typeof res === 'number' && !isNaN(res) ? res : null;
          } catch {
            return null;
          }
        }
        return activePreset.fn(x);
      };

      ctx.beginPath();
      let started = false;

      for (let i = 0; i <= activeSteps; i++) {
        const x = xMin + (i / totalSteps) * (xMax - xMin);
        const y = evaluateFn(x);

        if (y === null || y < yMin - 10 || y > yMax + 10) {
          started = false;
          continue;
        }

        const sx = toScreenX(x);
        const sy = toScreenY(y);

        if (!started) {
          ctx.moveTo(sx, sy);
          started = true;
        } else {
          ctx.lineTo(sx, sy);
        }

        tracerPoint = { x: sx, y: sy };
      }
      ctx.stroke();

      // If ellipse or parabola (has negative branch)
      if (!useCustomEquation && activePreset.name.includes('±')) {
        ctx.beginPath();
        let startedNeg = false;
        for (let i = 0; i <= activeSteps; i++) {
          const x = xMin + (i / totalSteps) * (xMax - xMin);
          const yPos = evaluateFn(x);
          if (yPos === null) {
            startedNeg = false;
            continue;
          }
          const y = -yPos;
          const sx = toScreenX(x);
          const sy = toScreenY(y);
          if (!startedNeg) {
            ctx.moveTo(sx, sy);
            startedNeg = true;
          } else {
            ctx.lineTo(sx, sy);
          }
        }
        ctx.stroke();
      }
    } else {
      // Table Mode Plot
      const pts = parsedTablePoints();
      if (pts.length > 1) {
        const numSegments = pts.length - 1;
        const currentSegmentFloat = numSegments * growthProgress;
        const fullSegments = Math.floor(currentSegmentFloat);
        const remainder = currentSegmentFloat - fullSegments;

        ctx.beginPath();
        ctx.moveTo(toScreenX(pts[0].x), toScreenY(pts[0].y));

        for (let i = 0; i < fullSegments; i++) {
          const sx = toScreenX(pts[i + 1].x);
          const sy = toScreenY(pts[i + 1].y);
          ctx.lineTo(sx, sy);
          tracerPoint = { x: sx, y: sy };
        }

        if (remainder > 0 && fullSegments < numSegments) {
          const p1 = pts[fullSegments];
          const p2 = pts[fullSegments + 1];
          const curX = p1.x + (p2.x - p1.x) * remainder;
          const curY = p1.y + (p2.y - p1.y) * remainder;
          const sx = toScreenX(curX);
          const sy = toScreenY(curY);
          ctx.lineTo(sx, sy);
          tracerPoint = { x: sx, y: sy };
        }

        ctx.stroke();

        // Draw points plotted so far
        for (let i = 0; i <= fullSegments && i < pts.length; i++) {
          const sx = toScreenX(pts[i].x);
          const sy = toScreenY(pts[i].y);
          ctx.beginPath();
          ctx.arc(sx, sy, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#10B981';
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Coordinate tag
          ctx.fillStyle = isLight ? '#111827' : '#FFFFFF';
          ctx.font = '10px monospace';
          ctx.fillText(`(${pts[i].x}, ${pts[i].y})`, sx + 8, sy - 8);
        }
      }
    }

    // Draw Leading Animated Glow Tracer
    if (tracerPoint && growthProgress > 0 && growthProgress < 1) {
      ctx.beginPath();
      ctx.arc(tracerPoint.x, tracerPoint.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? '#0077EE' : '#38BDF8';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pulsing outer halo
      ctx.beginPath();
      ctx.arc(tracerPoint.x, tracerPoint.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? 'rgba(0, 119, 238, 0.25)' : 'rgba(56, 189, 248, 0.35)';
      ctx.fill();
    }
  }, [
    mode,
    activePreset,
    growthProgress,
    isLight,
    selectedPresetIndex,
    useCustomEquation,
    customEquationInput,
    parsedTablePoints,
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5000,
        background: isLight ? 'rgba(238, 242, 248, 0.96)' : 'rgba(6, 8, 12, 0.95)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* ── Top Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: isLight ? '1px solid rgba(0, 0, 0, 0.12)' : '1px solid rgba(255, 255, 255, 0.12)',
          background: isLight ? '#FFFFFF' : 'rgba(16, 20, 28, 0.85)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: isLight ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(255,255,255,0.25)',
              borderRadius: '6px',
              color: isLight ? '#111114' : '#F2F2F2',
              padding: '6px 14px',
              fontFamily: 'var(--font-subheading)',
              fontSize: '11px',
              letterSpacing: '1px',
              cursor: 'pointer',
            }}
          >
            ← BACK
          </button>
          <div>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-subheading)', color: isLight ? '#6B7280' : 'rgba(242,242,242,0.45)', letterSpacing: '1px' }}>
              MATHEMATICS • REAL-TIME ANIMATED GRAPH PLOTTER
            </span>
            <h2 style={{ fontSize: '18px', fontFamily: 'var(--font-heading)', margin: '2px 0 0', letterSpacing: '2px', color: isLight ? '#111114' : '#FFFFFF' }}>
              INTERACTIVE GRAPH ENGINE
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={startGraphGrowth}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
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
            <span>▶</span>
            <span>ANIMATE GROWTH</span>
          </button>
        </div>
      </div>

      {/* ── Main Split Canvas & Controls ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Side: Equation / Table Inputs */}
        <div
          style={{
            width: '360px',
            borderRight: isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.1)',
            padding: '20px',
            overflowY: 'auto',
            background: isLight ? '#FFFFFF' : 'rgba(12, 16, 22, 0.75)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Mode Switch: Function vs Table */}
          <div style={{ display: 'flex', gap: '6px', background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)', padding: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => {
                setMode('function');
                setUseCustomEquation(false);
              }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                fontFamily: 'var(--font-heading)',
                fontSize: '11px',
                cursor: 'pointer',
                background: mode === 'function' ? (isLight ? '#FFFFFF' : '#38BDF8') : 'transparent',
                color: mode === 'function' ? (isLight ? '#111114' : '#000000') : (isLight ? '#6B7280' : 'rgba(242,242,242,0.6)'),
                fontWeight: 700,
              }}
            >
              f(x) FUNCTION
            </button>
            <button
              onClick={() => setMode('table')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                fontFamily: 'var(--font-heading)',
                fontSize: '11px',
                cursor: 'pointer',
                background: mode === 'table' ? (isLight ? '#FFFFFF' : '#38BDF8') : 'transparent',
                color: mode === 'table' ? (isLight ? '#111114' : '#000000') : (isLight ? '#6B7280' : 'rgba(242,242,242,0.6)'),
                fontWeight: 700,
              }}
            >
              (X, Y) TABLE
            </button>
          </div>

          {mode === 'function' ? (
            <>
              {/* Presets List */}
              <div>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-subheading)', letterSpacing: '1px', color: isLight ? '#4B5563' : 'rgba(242,242,242,0.5)', display: 'block', marginBottom: '8px' }}>
                  CLASS 12 SYLLABUS PRESETS:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {PRESET_EQUATIONS.map((eq, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedPresetIndex(idx);
                        setUseCustomEquation(false);
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        background: selectedPresetIndex === idx && !useCustomEquation
                          ? (isLight ? 'rgba(0,119,238,0.12)' : 'rgba(56,189,248,0.18)')
                          : (isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.04)'),
                        border: selectedPresetIndex === idx && !useCustomEquation
                          ? (isLight ? '1.5px solid #0077EE' : '1.5px solid #38BDF8')
                          : (isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)'),
                        color: isLight ? '#111114' : '#FFFFFF',
                      }}
                    >
                      <div style={{ fontSize: '10px', fontFamily: 'monospace', color: isLight ? '#0077EE' : '#38BDF8', fontWeight: 700 }}>
                        {eq.category}
                      </div>
                      <div style={{ fontSize: '12px', fontFamily: 'var(--font-heading)', margin: '2px 0' }}>
                        {eq.name}
                      </div>
                      <div style={{ fontSize: '11px', fontFamily: 'var(--font-content)', color: isLight ? '#4B5563' : 'rgba(242,242,242,0.6)' }}>
                        {eq.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Expression Input */}
              <div style={{ borderTop: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-subheading)', letterSpacing: '1px', color: isLight ? '#4B5563' : 'rgba(242,242,242,0.5)', display: 'block', marginBottom: '6px' }}>
                  OR ENTER CUSTOM FORMULA y = f(x):
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    value={customEquationInput}
                    onChange={(e) => {
                      setCustomEquationInput(e.target.value);
                      setUseCustomEquation(true);
                    }}
                    placeholder="e.g. 2 * x + 3 or Math.sin(x)"
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: '6px',
                      background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)',
                      border: isLight ? '1px solid rgba(0,0,0,0.15)' : '1px solid rgba(255,255,255,0.2)',
                      color: isLight ? '#111114' : '#FFFFFF',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                    }}
                  />
                  <button
                    onClick={() => {
                      setUseCustomEquation(true);
                      startGraphGrowth();
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: isLight ? '#111114' : '#38BDF8',
                      color: isLight ? '#FFFFFF' : '#000000',
                      border: 'none',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    PLOT
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-subheading)', letterSpacing: '1px', color: isLight ? '#4B5563' : 'rgba(242,242,242,0.5)', display: 'block', marginBottom: '6px' }}>
                ENTER (X, Y) COORDINATES (ONE PER LINE):
              </span>
              <textarea
                value={tablePointsText}
                onChange={(e) => setTablePointsText(e.target.value)}
                rows={12}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)',
                  border: isLight ? '1px solid rgba(0,0,0,0.15)' : '1px solid rgba(255,255,255,0.18)',
                  color: isLight ? '#111114' : '#FFFFFF',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  lineHeight: 1.5,
                  boxSizing: 'border-box',
                  resize: 'none',
                }}
              />
              <button
                onClick={startGraphGrowth}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  padding: '10px',
                  borderRadius: '6px',
                  background: isLight ? '#111114' : '#38BDF8',
                  color: isLight ? '#FFFFFF' : '#000000',
                  border: 'none',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                ANIMATE TABLE GRAPH
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Graph Canvas & Animation Status */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '24px 32px',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '820px',
              height: '520px',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: isLight
                ? '0 14px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)'
                : '0 16px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
              border: isLight ? '1.5px solid rgba(0,0,0,0.12)' : '1px solid rgba(255,255,255,0.15)',
              position: 'relative',
            }}
          >
            <canvas
              ref={canvasRef}
              width={820}
              height={520}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />

            {/* Animation Progress Bar */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '4px',
                width: `${growthProgress * 100}%`,
                background: isLight ? '#0077EE' : '#38BDF8',
                transition: isAnimating ? 'none' : 'width 0.2s ease',
              }}
            />

            {/* Status Callout Badge */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: isLight ? 'rgba(255,255,255,0.92)' : 'rgba(10,12,18,0.88)',
                border: isLight ? '1px solid rgba(0,0,0,0.12)' : '1px solid rgba(255,255,255,0.15)',
                fontFamily: 'monospace',
                fontSize: '11px',
                fontWeight: 700,
                color: isLight ? '#0077EE' : '#38BDF8',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              {isAnimating ? `DRAWING GRAPH (${Math.round(growthProgress * 100)}%)` : '✓ GRAPH COMPLETE'}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InteractiveGraphModal;
