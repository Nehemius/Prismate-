import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { QuizQuestion, DifficultyLevel, ListType } from '../types/prismate';
import { useApp } from '../context/useApp';
import UniversalLoader from './UniversalLoader';
import { fetchQuestionsFromSupabase } from '../lib/supabase';

/**
 * Universal Quiz Engine Component
 *
 * SPECIFICATION (PRISMATE_UI_SPEC.md §9):
 *   - §9.1 Setup View: Filter by Lesson, List Filter (All, Strong, Study, Weak),
 *                     Time Control toggle, Difficulty (Classic=3 hearts, Expert=2 hearts, Master=1 heart).
 *   - §9.2 Countdown & Loader: Universal star polygon displays active subject, selected filters, and difficulty,
 *                              followed by a 3, 2, 1 countdown before gameplay.
 *   - §9.3 Gameplay: Full-screen multiple choice (4 options in content font),
 *                    hearts counter, timer, score.
 *   - §9.4 Game-Over & Review: Particle-wither dissolve canvas effect, review of missed questions,
 *                              updating Weaklist / Stronglist data.
 */

interface QuizEngineProps {
  title: string;
  subject: 'chemistry' | 'physics' | 'mathematics';
  questions: QuizQuestion[];
  onClose: () => void;
}

type QuizPhase = 'setup' | 'loading' | 'countdown' | 'playing' | 'wither' | 'gameover';

/** Cleanly format LaTeX symbols and math equations into readable unicode typography */
function formatMathText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\varepsilon_0/g, 'ε₀')
    .replace(/\\varepsilon_r/g, 'εᵣ')
    .replace(/\\varepsilon/g, 'ε')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\pi/g, 'π')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\tau/g, 'τ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\Phi_E/g, 'Φ_E')
    .replace(/\\Phi/g, 'Φ')
    .replace(/\\vec\{([^}]+)\}/g, '$1⃗')
    .replace(/\\hat\{([^}]+)\}/g, '$1̂')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
    .replace(/\\left\(/g, '(')
    .replace(/\\right\)/g, ')')
    .replace(/\\int_0\^2/g, '∫₀²')
    .replace(/\\oint/g, '∮')
    .replace(/\\propto/g, '∝')
    .replace(/\\implies/g, '⟹')
    .replace(/\\pm/g, '±')
    .replace(/\\infty/g, '∞')
    .replace(/\^\\circ/g, '°')
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/\^4/g, '⁴')
    .replace(/\^5/g, '⁵')
    .replace(/\^\{-1\}/g, '⁻¹')
    .replace(/\^\{-2\}/g, '⁻²')
    .replace(/\^\{-3\}/g, '⁻³')
    .replace(/\^\{-19\}/g, '⁻¹⁹')
    .replace(/\^\{-21\}/g, '⁻²¹')
    .replace(/\^\{-31\}/g, '⁻³¹')
    .replace(/\^\{-34\}/g, '⁻³⁴')
    .replace(/\\,/g, ' ');
}

// ─── 2D Canvas Particle-Wither Dissolve (§9.4) ──────────────────────────────
const WitherCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Spawn 280 ash particles scattering upward and outward
    const particles = Array.from({ length: 280 }, () => ({
      x: window.innerWidth * 0.2 + Math.random() * (window.innerWidth * 0.6),
      y: window.innerHeight * 0.3 + Math.random() * (window.innerHeight * 0.4),
      vx: (Math.random() - 0.5) * 3.5,
      vy: -(Math.random() * 4.0 + 1.5),
      size: Math.random() * 3 + 1,
      alpha: Math.random() * 0.6 + 0.4,
      decay: Math.random() * 0.015 + 0.01,
    }));

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#F2F2F2';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha > 0) {
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillRect(p.x, p.y, p.size, p.size);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 6000,
        pointerEvents: 'none',
      }}
    />
  );
};

export const QuizEngine: React.FC<QuizEngineProps> = ({
  title,
  subject,
  questions,
  onClose,
}) => {
  const { addToList, isInList } = useApp();

  // Loaded questions with Supabase live fetch and offline local fallback
  const [loadedQuestions, setLoadedQuestions] = useState<QuizQuestion[]>(questions);

  useEffect(() => {
    let isMounted = true;
    fetchQuestionsFromSupabase(subject).then((remoteQuestions) => {
      if (isMounted && remoteQuestions && remoteQuestions.length > 0) {
        setLoadedQuestions(remoteQuestions);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [subject]);

  // Setup state
  const [selectedFilter, setSelectedFilter] = useState<'all' | ListType>('all');
  const [timeControl, setTimeControl] = useState(true);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('classic');

  // Gameplay state
  const [phase, setPhase] = useState<QuizPhase>('setup');
  const [countdown, setCountdown] = useState(3);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [maxHearts, setMaxHearts] = useState(3);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [wrongQuestionIds, setWrongQuestionIds] = useState<string[]>([]);

  const timerRef = useRef<number | null>(null);
  const heartsRef = useRef<number>(3);
  const isAnswerCheckedRef = useRef<boolean>(false);

  // Filter questions based on selection
  const filteredQuestions = loadedQuestions.filter((q) => {
    if (selectedFilter === 'all') return true;
    return isInList(selectedFilter, q.question);
  });

  const activeQuestions = filteredQuestions.length > 0 ? filteredQuestions : loadedQuestions;
  const currentQ = activeQuestions[currentIndex];

  // Start sequence (§9.2: Loader with metadata -> Countdown -> Gameplay)
  const handleStart = () => {
    const h = difficulty === 'classic' ? 3 : difficulty === 'expert' ? 2 : 1;
    setHearts(h);
    setMaxHearts(h);
    heartsRef.current = h;
    isAnswerCheckedRef.current = false;
    setScore(0);
    setCurrentIndex(0);
    setWrongQuestionIds([]);
    setPhase('loading');
    setTimeout(() => {
      setCountdown(3);
      setPhase('countdown');
    }, 1100);
  };

  // Countdown timer effect
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown > 1) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 800);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setPhase('playing');
        setTimeLeft(25);
      }, 800);
      return () => clearTimeout(t);
    }
  }, [phase, countdown]);

  const handleOptionSelect = useCallback(
    (index: number) => {
      if (isAnswerCheckedRef.current) return;
      isAnswerCheckedRef.current = true;
      setSelectedAnswer(index);
      setIsAnswerChecked(true);

      const isCorrect = index === currentQ.correctIndex;

      if (isCorrect) {
        setScore((s) => s + 100 + timeLeft * 5);
        addToList('stronglist', {
          subject,
          category: 'question',
          title: currentQ.question,
          content: `Answer: ${currentQ.options[currentQ.correctIndex]}`,
          source: `${title} (${currentQ.topic})`,
        });

        setTimeout(() => {
          if (currentIndex + 1 < activeQuestions.length) {
            setCurrentIndex((idx) => idx + 1);
            setSelectedAnswer(null);
            isAnswerCheckedRef.current = false;
            setIsAnswerChecked(false);
            setTimeLeft(25);
          } else {
            setPhase('wither');
            setTimeout(() => setPhase('gameover'), 1200);
          }
        }, 1000);
      } else {
        setWrongQuestionIds((prev) => [...prev, currentQ.id]);
        const remainingHearts = heartsRef.current - 1;
        heartsRef.current = remainingHearts;
        setHearts(remainingHearts);

        addToList('weaklist', {
          subject,
          category: 'question',
          title: currentQ.question,
          content: `Answer: ${currentQ.options[currentQ.correctIndex]}`,
          source: `${title} (${currentQ.topic})`,
        });

        if (remainingHearts <= 0) {
          setTimeout(() => {
            setPhase('wither');
            setTimeout(() => setPhase('gameover'), 1200);
          }, 350);
        } else {
          setTimeout(() => {
            if (currentIndex + 1 < activeQuestions.length) {
              setCurrentIndex((idx) => idx + 1);
              setSelectedAnswer(null);
              isAnswerCheckedRef.current = false;
              setIsAnswerChecked(false);
              setTimeLeft(25);
            } else {
              setPhase('wither');
              setTimeout(() => setPhase('gameover'), 1200);
            }
          }, 1100);
        }
      }
    },
    [currentQ, timeLeft, addToList, subject, title, currentIndex, activeQuestions.length]
  );

  // Gameplay question countdown
  useEffect(() => {
    if (phase !== 'playing' || !timeControl || isAnswerChecked) return;

    if (timeLeft > 0) {
      timerRef.current = window.setTimeout(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            handleOptionSelect(-1);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [phase, timeLeft, timeControl, isAnswerChecked, handleOptionSelect]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5000,
        background: '#000000',
        color: '#F2F2F2',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* ── Top Bar ───────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 32px',
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
            ← EXIT
          </button>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '16px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            {title}
          </span>
        </div>

        {/* HUD during playing: Hearts + Score + Timer */}
        {phase === 'playing' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            {/* Hearts indicator */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: maxHearts }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '18px',
                    color: i < hearts ? '#EB104B' : 'rgba(242,242,242,0.18)',
                    transition: 'color 0.3s ease',
                  }}
                >
                  ♥
                </span>
              ))}
            </div>

            {/* Timer */}
            {timeControl && (
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '16px',
                  color: timeLeft <= 5 ? '#EB104B' : '#F2F2F2',
                  letterSpacing: '1px',
                }}
              >
                ⏱ {timeLeft}s
              </span>
            )}

            {/* Score */}
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '16px',
                color: '#F2F2F2',
                letterSpacing: '1px',
              }}
            >
              SCORE: {score}
            </span>
          </div>
        )}
      </div>

      {/* ── Phase 1: Setup View (§9.1) ────────────────────────────────────── */}
      {phase === 'setup' && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            maxWidth: '680px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '28px',
              letterSpacing: '4px',
              marginBottom: '32px',
              textAlign: 'center',
            }}
          >
            QUIZ CONFIGURATION
          </h2>

          {/* List Filter (§9.1) */}
          <div style={{ width: '100%', marginBottom: '24px' }}>
            <label
              style={{
                fontFamily: 'var(--font-subheading)',
                fontSize: '12px',
                letterSpacing: '2px',
                color: 'rgba(242,242,242,0.5)',
                display: 'block',
                marginBottom: '10px',
              }}
            >
              SOURCE LIST FILTER
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {(['all', 'weaklist', 'stronglist', 'studylist'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  style={{
                    background: selectedFilter === filter ? '#F2F2F2' : 'rgba(242,242,242,0.06)',
                    border: '1px solid rgba(242,242,242,0.2)',
                    color: selectedFilter === filter ? '#000000' : '#F2F2F2',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '11px',
                    letterSpacing: '1px',
                    padding: '12px 6px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty (§9.1) */}
          <div style={{ width: '100%', marginBottom: '24px' }}>
            <label
              style={{
                fontFamily: 'var(--font-subheading)',
                fontSize: '12px',
                letterSpacing: '2px',
                color: 'rgba(242,242,242,0.5)',
                display: 'block',
                marginBottom: '10px',
              }}
            >
              DIFFICULTY LEVEL
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {(
                [
                  { id: 'classic', label: 'CLASSIC (3 ♥)' },
                  { id: 'expert', label: 'EXPERT (2 ♥)' },
                  { id: 'master', label: 'MASTER (1 ♥)' },
                ] as const
              ).map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  style={{
                    background: difficulty === d.id ? '#F2F2F2' : 'rgba(242,242,242,0.06)',
                    border: '1px solid rgba(242,242,242,0.2)',
                    color: difficulty === d.id ? '#000000' : '#F2F2F2',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '11px',
                    letterSpacing: '1px',
                    padding: '12px 8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Control Toggle */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              background: 'rgba(242,242,242,0.04)',
              border: '1px solid rgba(242,242,242,0.12)',
              borderRadius: '8px',
              marginBottom: '36px',
            }}
          >
            <div>
              <p style={{ fontFamily: 'var(--font-subheading)', fontSize: '14px', margin: 0 }}>
                25-SECOND SPEED TIMER
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-content)',
                  fontSize: '12px',
                  color: 'rgba(242,242,242,0.4)',
                  margin: '2px 0 0',
                }}
              >
                Speed bonus points awarded for rapid correct answers
              </p>
            </div>
            <button
              onClick={() => setTimeControl((t) => !t)}
              style={{
                background: timeControl ? '#F2F2F2' : 'rgba(242,242,242,0.1)',
                color: timeControl ? '#000000' : '#F2F2F2',
                border: 'none',
                borderRadius: '16px',
                padding: '6px 16px',
                fontFamily: 'var(--font-heading)',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              {timeControl ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            style={{
              width: '100%',
              background: '#F2F2F2',
              color: '#000000',
              border: 'none',
              borderRadius: '8px',
              padding: '16px',
              fontFamily: 'var(--font-heading)',
              fontSize: '16px',
              letterSpacing: '3px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(242,242,242,0.2)',
            }}
          >
            START DRILL →
          </button>
        </div>
      )}

      {/* ── Phase 1.5: Universal Loader with Metadata (§9.2) ────────────── */}
      <UniversalLoader
        visible={phase === 'loading'}
        metadata={{
          subject: subject.toUpperCase(),
          filter: selectedFilter.toUpperCase(),
          difficulty: difficulty.toUpperCase(),
        }}
      />

      {/* ── Phase 3.5: Particle-Wither Ash Dissolve Canvas (§9.4) ─────────── */}
      {phase === 'wither' && <WitherCanvas />}

      {/* ── Phase 2: Countdown (§9.2) ─────────────────────────────────────── */}
      {phase === 'countdown' && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(72px, 16vw, 140px)',
              letterSpacing: '8px',
              color: '#F2F2F2',
              lineHeight: 1,
              animation: 'pulse 0.8s ease infinite alternate',
            }}
          >
            {countdown}
          </span>
          <p
            style={{
              fontFamily: 'var(--font-subheading)',
              fontSize: '14px',
              letterSpacing: '3px',
              color: 'rgba(242,242,242,0.4)',
              marginTop: '16px',
            }}
          >
            PREPARE YOUR RECALL
          </p>
        </div>
      )}

      {/* ── Phase 3: Active Gameplay (§9.3) ───────────────────────────────── */}
      {phase === 'playing' && currentQ && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            maxWidth: '960px',
            margin: '0 auto',
            padding: '32px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Progress & Chapter */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '16px',
              fontFamily: 'var(--font-subheading)',
              fontSize: '12px',
              letterSpacing: '2px',
              color: 'rgba(242,242,242,0.4)',
            }}
          >
            <span>TOPIC: {currentQ.topic.toUpperCase()}</span>
            <span>
              QUESTION {currentIndex + 1} OF {activeQuestions.length}
            </span>
          </div>

          {/* Question Body */}
          {currentQ.requiresDiagram && (
            <div style={{ marginBottom: '12px' }}>
              <span
                style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '11px',
                  letterSpacing: '1.5px',
                  color: 'rgba(242,242,242,0.85)',
                  background: 'rgba(242,242,242,0.1)',
                  border: '1px solid rgba(242,242,242,0.25)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                }}
              >
                FIGURE REQUIRED (REFER TO TEXTBOOK PG {currentQ.sourcePage ?? 71})
              </span>
            </div>
          )}
          <h2
            style={{
              fontFamily: 'var(--font-content)',
              fontSize: 'clamp(20px, 2.2vw, 30px)',
              lineHeight: 1.4,
              color: '#F2F2F2',
              marginBottom: '40px',
              fontWeight: 500,
            }}
          >
            {formatMathText(currentQ.question)}
          </h2>

          {/* Options Grid (4 options in content font §9.3) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {currentQ.options.map((opt, idx) => {
              let bg = 'rgba(242,242,242,0.05)';
              let border = '1px solid rgba(242,242,242,0.18)';
              let color = '#F2F2F2';

              if (isAnswerChecked) {
                if (idx === currentQ.correctIndex) {
                  bg = 'rgba(242,242,242,0.95)';
                  color = '#000000';
                  border = '1px solid #F2F2F2';
                } else if (idx === selectedAnswer) {
                  bg = 'rgba(235,16,75,0.25)';
                  border = '1px solid #EB104B';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  disabled={isAnswerChecked}
                  style={{
                    background: bg,
                    border,
                    color,
                    borderRadius: '12px',
                    padding: '20px 24px',
                    textAlign: 'left',
                    fontFamily: 'var(--font-content)',
                    fontSize: '16px',
                    lineHeight: 1.4,
                    cursor: isAnswerChecked ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isAnswerChecked) e.currentTarget.style.borderColor = 'rgba(242,242,242,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isAnswerChecked) e.currentTarget.style.borderColor = 'rgba(242,242,242,0.18)';
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '12px',
                      color: 'rgba(242,242,242,0.4)',
                      marginRight: '12px',
                    }}
                  >
                    {['A', 'B', 'C', 'D'][idx]}.
                  </span>
                  {formatMathText(opt)}
                </button>
              );
            })}
          </div>

          {/* Explanation reveal */}
          {isAnswerChecked && (
            <p
              style={{
                fontFamily: 'var(--font-content)',
                fontSize: '13px',
                color: 'rgba(242,242,242,0.65)',
                marginTop: '24px',
                lineHeight: 1.5,
              }}
            >
              💡 {formatMathText(currentQ.explanation)}
            </p>
          )}
        </div>
      )}

      {/* ── Phase 4: Game Over & Review (§9.4) ────────────────────────────── */}
      {phase === 'gameover' && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            maxWidth: '640px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '36px',
              letterSpacing: '6px',
              color: hearts > 0 ? '#F2F2F2' : '#EB104B',
              marginBottom: '12px',
            }}
          >
            {hearts > 0 ? 'SESSION COMPLETE' : 'HEARTS DEPLETED'}
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-content)',
              fontSize: '14px',
              color: 'rgba(242,242,242,0.5)',
              marginBottom: '32px',
            }}
          >
            {hearts > 0
              ? 'Great performance! Your strong items have been logged.'
              : 'Mistakes have been logged automatically to your Weaklist for review.'}
          </p>

          <div
            style={{
              width: '100%',
              background: 'rgba(242,242,242,0.04)',
              border: '1px solid rgba(242,242,242,0.12)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '32px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
            }}
          >
            <div>
              <p style={{ fontFamily: 'var(--font-subheading)', fontSize: '11px', color: 'rgba(242,242,242,0.4)' }}>
                FINAL SCORE
              </p>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', margin: '4px 0 0' }}>{score}</h3>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-subheading)', fontSize: '11px', color: 'rgba(242,242,242,0.4)' }}>
                HEARTS LEFT
              </p>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', margin: '4px 0 0' }}>
                {hearts} / {maxHearts}
              </h3>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-subheading)', fontSize: '11px', color: 'rgba(242,242,242,0.4)' }}>
                WEAKLIST ADDED
              </p>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', margin: '4px 0 0' }}>
                {wrongQuestionIds.length}
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
            <button
              onClick={handleStart}
              style={{
                flex: 1,
                background: '#F2F2F2',
                color: '#000000',
                border: 'none',
                borderRadius: '8px',
                padding: '14px',
                fontFamily: 'var(--font-heading)',
                fontSize: '13px',
                letterSpacing: '2px',
                cursor: 'pointer',
              }}
            >
              RETRY DRILL
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                background: 'transparent',
                color: '#F2F2F2',
                border: '1px solid rgba(242,242,242,0.25)',
                borderRadius: '8px',
                padding: '14px',
                fontFamily: 'var(--font-heading)',
                fontSize: '13px',
                letterSpacing: '2px',
                cursor: 'pointer',
              }}
            >
              BACK TO WORKSPACE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizEngine;
