import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { QuizQuestion, DifficultyLevel, ListType } from '../types/prismate';
import { useApp } from '../context/useApp';
import UniversalLoader from './UniversalLoader';
import QuizCountdown from './QuizCountdown';
import { fetchQuestionsFromSupabase } from '../lib/supabase';

interface QuizEngineProps {
  title: string;
  subject: 'chemistry' | 'physics' | 'mathematics';
  questions: QuizQuestion[];
  onClose: () => void;
}

type QuizPhase = 'setup' | 'loading' | 'countdown' | 'playing' | 'wither' | 'gameover';
type AnswerOutcome = 'correct' | 'wrong' | 'timeout' | null;

/** Cleanly format LaTeX symbols and math equations into readable typography */
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

// ─── 2D Canvas Particle-Wither Dissolve ──────────────────────────────
const WitherCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

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

  // Loaded questions with Supabase fetch + offline local fallback
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
  const [countdownRunId, setCountdownRunId] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [maxHearts, setMaxHearts] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [outcome, setOutcome] = useState<AnswerOutcome>(null);
  const [isFlipped, setIsFlipped] = useState(false);
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

  // Start sequence
  const handleStart = () => {
    const h = difficulty === 'classic' ? 3 : difficulty === 'expert' ? 2 : 1;
    setHearts(h);
    setMaxHearts(h);
    heartsRef.current = h;
    isAnswerCheckedRef.current = false;
    setScore(0);
    setStreak(0);
    setCurrentIndex(0);
    setWrongQuestionIds([]);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setOutcome(null);
    setIsFlipped(false);
    setPhase('loading');

    setTimeout(() => {
      setCountdownRunId((r) => r + 1);
      setPhase('countdown');
    }, 1000);
  };

  const handleCountdownComplete = () => {
    setPhase('playing');
    setTimeLeft(25);
    setIsFlipped(false);
    setOutcome(null);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    isAnswerCheckedRef.current = false;
  };

  // Move to next question or end drill
  const advanceToNextQuestion = useCallback(() => {
    if (currentIndex + 1 < activeQuestions.length && heartsRef.current > 0) {
      setCurrentIndex((idx) => idx + 1);
      setSelectedAnswer(null);
      isAnswerCheckedRef.current = false;
      setIsAnswerChecked(false);
      setOutcome(null);
      setIsFlipped(false);
      setTimeLeft(25);
    } else {
      setPhase('wither');
      setTimeout(() => setPhase('gameover'), 1100);
    }
  }, [currentIndex, activeQuestions.length]);

  // Handle option select / answer submission
  const handleOptionSelect = useCallback(
    (index: number) => {
      if (isAnswerCheckedRef.current || !currentQ) return;
      isAnswerCheckedRef.current = true;
      setSelectedAnswer(index);
      setIsAnswerChecked(true);

      const isTimeout = index === -1;
      const isCorrect = !isTimeout && index === currentQ.correctIndex;

      if (isCorrect) {
        setOutcome('correct');
        const points = 100 + timeLeft * 5 + streak * 20;
        setScore((s) => s + points);
        setStreak((s) => s + 1);

        addToList('stronglist', {
          subject,
          category: 'question',
          title: currentQ.question,
          content: `Answer: ${currentQ.options[currentQ.correctIndex]}`,
          source: `${title} (${currentQ.topic})`,
        });

        // Auto-flip after a brief impact celebration
        setTimeout(() => {
          setIsFlipped(true);
        }, 650);
      } else {
        setOutcome(isTimeout ? 'timeout' : 'wrong');
        setStreak(0);
        setWrongQuestionIds((prev) => [...prev, currentQ.id]);
        const remainingHearts = Math.max(0, heartsRef.current - 1);
        heartsRef.current = remainingHearts;
        setHearts(remainingHearts);

        addToList('weaklist', {
          subject,
          category: 'question',
          title: currentQ.question,
          content: `Answer: ${currentQ.options[currentQ.correctIndex]}`,
          source: `${title} (${currentQ.topic})`,
        });

        // Auto-flip after withering/wasted animation to study solution
        setTimeout(() => {
          setIsFlipped(true);
        }, 950);
      }
    },
    [currentQ, timeLeft, streak, addToList, subject, title]
  );

  // Spaced-repetition rating on card back (Kokonut UI pattern)
  const handleRateRetention = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (rating === 'again' || rating === 'hard') {
      addToList('weaklist', {
        subject,
        category: 'question',
        title: currentQ.question,
        content: `Answer: ${currentQ.options[currentQ.correctIndex]}`,
        source: `${title} (${currentQ.topic})`,
      });
    } else {
      addToList('stronglist', {
        subject,
        category: 'question',
        title: currentQ.question,
        content: `Answer: ${currentQ.options[currentQ.correctIndex]}`,
        source: `${title} (${currentQ.topic})`,
      });
    }
    advanceToNextQuestion();
  };

  // Keyboard navigation (Manus style)
  useEffect(() => {
    if (phase !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Option selection via 1, 2, 3, 4 or A, B, C, D
      if (!isAnswerChecked && !isFlipped) {
        if (e.key === '1' || e.key === 'a' || e.key === 'A') handleOptionSelect(0);
        else if (e.key === '2' || e.key === 'b' || e.key === 'B') handleOptionSelect(1);
        else if (e.key === '3' || e.key === 'c' || e.key === 'C') handleOptionSelect(2);
        else if (e.key === '4' || e.key === 'd' || e.key === 'D') handleOptionSelect(3);
      }

      // Spacebar to flip or advance
      if (e.code === 'Space') {
        e.preventDefault();
        if (isFlipped) {
          advanceToNextQuestion();
        } else {
          setIsFlipped(true);
        }
      }

      // ESC to close
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, isAnswerChecked, isFlipped, handleOptionSelect, advanceToNextQuestion, onClose]);

  // Timer countdown tick
  useEffect(() => {
    if (phase !== 'playing' || !timeControl || isAnswerChecked || isFlipped) return;

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
  }, [phase, timeLeft, timeControl, isAnswerChecked, isFlipped, handleOptionSelect]);

  const isWrong = outcome === 'wrong';
  const isTimeout = outcome === 'timeout';
  const isCorrect = outcome === 'correct';

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
      {/* ── Top Bar HUD ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 28px',
          background: '#0A0A0A',
          borderBottom: '1px solid rgba(242,242,242,0.10)',
          position: 'relative',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid rgba(242,242,242,0.22)',
              borderRadius: '6px',
              color: '#F2F2F2',
              fontFamily: 'var(--font-subheading)',
              fontSize: '11px',
              letterSpacing: '2px',
              padding: '6px 14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#F2F2F2')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(242,242,242,0.22)')}
          >
            ← EXIT [ESC]
          </button>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '15px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            {title}
          </span>
        </div>

        {/* HUD during playing */}
        {phase === 'playing' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Streak Combo */}
            {streak > 1 && (
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '12px',
                  letterSpacing: '1.5px',
                  color: '#FFFFFF',
                  background: 'rgba(242,242,242,0.12)',
                  border: '1px solid rgba(242,242,242,0.3)',
                  padding: '4px 10px',
                  borderRadius: '20px',
                }}
              >
                🔥 {streak}X STREAK
              </span>
            )}

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
                  fontSize: '15px',
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
                fontSize: '15px',
                color: '#F2F2F2',
                letterSpacing: '1px',
              }}
            >
              SCORE: {score}
            </span>
          </div>
        )}
      </div>

      {/* ── Phase 1: Setup View ─────────────────────────────────────────── */}
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

          {/* List Filter */}
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

          {/* Difficulty */}
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

          {/* Speed Timer Toggle */}
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

          {/* Start Drill Button */}
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

      {/* ── Phase 1.5: Universal Star Loader ────────────────────────────── */}
      <UniversalLoader
        visible={phase === 'loading'}
        metadata={{
          subject: subject.toUpperCase(),
          filter: selectedFilter.toUpperCase(),
          difficulty: difficulty.toUpperCase(),
        }}
      />

      {/* ── Phase 2: Asphalt Legends 3-2-1-GO Countdown ─────────────────── */}
      <QuizCountdown
        active={phase === 'countdown'}
        runId={countdownRunId}
        onComplete={handleCountdownComplete}
        specs={[
          {
            label: 'SUBJECT & TOPIC',
            word: subject.toUpperCase(),
            caption: currentQ?.topic || 'Curriculum Evaluation',
          },
          {
            label: 'TIME CONTROL',
            word: timeControl ? 'TIMED' : 'UNTIMED',
            caption: timeControl ? '25 Seconds Speed Timer Active' : 'Relaxed Mode • No Timer',
          },
          {
            label: 'DIFFICULTY',
            word: difficulty.toUpperCase(),
            caption:
              difficulty === 'classic'
                ? '3 Hearts Allowed'
                : difficulty === 'expert'
                ? '2 Hearts Allowed'
                : '1 Heart Only • Sudden Death',
          },
        ]}
      />

      {/* ── Phase 3: Active Gameplay with 3D Flashcard ──────────────────── */}
      {phase === 'playing' && currentQ && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            width: '100%',
            maxWidth: '920px',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          {/* Card Meta Bar */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              fontFamily: 'var(--font-subheading)',
              fontSize: '11px',
              letterSpacing: '1.5px',
              color: 'rgba(242,242,242,0.5)',
            }}
          >
            <span>TOPIC: {currentQ.topic.toUpperCase()}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button
                onClick={() => setIsFlipped((f) => !f)}
                style={{
                  background: 'none',
                  border: '1px solid rgba(242,242,242,0.25)',
                  borderRadius: '4px',
                  color: '#F2F2F2',
                  fontSize: '10px',
                  fontFamily: 'var(--font-subheading)',
                  letterSpacing: '1px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                }}
              >
                {isFlipped ? 'SHOW QUESTION [Space]' : 'FLIP TO SOLUTION [Space]'}
              </button>
              <span>
                QUESTION {currentIndex + 1} OF {activeQuestions.length}
              </span>
            </div>
          </div>

          {/* ── 3D Flashcard Container (Kokonut UI + Motion) ── */}
          <div
            className="flashcard-perspective"
            style={{
              width: '100%',
              minHeight: '440px',
              position: 'relative',
            }}
          >
            <div className={`flashcard-inner ${isFlipped ? 'flashcard-flipped' : ''}`}>
              {/* ── FRONT FACE: Question & Options ── */}
              <div
                className={`flashcard-face ${isTimeout ? 'al-grayscale' : ''}`}
                style={{
                  background: isWrong
                    ? 'linear-gradient(135deg, rgba(30,10,15,0.92), rgba(15,10,12,0.95))'
                    : 'linear-gradient(135deg, rgba(18,18,18,0.95), rgba(10,10,10,0.92))',
                  border: isWrong
                    ? '1px solid #EB104B'
                    : isCorrect
                    ? '1px solid #10B981'
                    : '1px solid rgba(242,242,242,0.18)',
                  borderRadius: '20px',
                  padding: '32px',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(242,242,242,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {/* Red impact flash on mistake */}
                {isWrong && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'radial-gradient(circle at center, rgba(235,16,75,0.45) 0%, transparent 70%)',
                      animation: 'al-red-flash 0.6s ease-out forwards',
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* Question Inner Content (withers on wrong) */}
                <div className={isWrong ? 'animate-wither' : ''}>
                  {/* Diagram flag */}
                  {currentQ.requiresDiagram && (
                    <div style={{ marginBottom: '12px' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '10px',
                          letterSpacing: '1.5px',
                          color: '#F2F2F2',
                          background: 'rgba(242,242,242,0.12)',
                          border: '1px solid rgba(242,242,242,0.25)',
                          padding: '4px 10px',
                          borderRadius: '4px',
                        }}
                      >
                        FIGURE REQUIRED (REFER TO TEXTBOOK PG {currentQ.sourcePage ?? 71})
                      </span>
                    </div>
                  )}

                  {/* Question Text */}
                  <h3
                    style={{
                      fontFamily: 'var(--font-content)',
                      fontSize: 'clamp(18px, 2vw, 24px)',
                      lineHeight: 1.45,
                      color: '#F2F2F2',
                      marginBottom: '28px',
                      fontWeight: 500,
                    }}
                  >
                    {formatMathText(currentQ.question)}
                  </h3>

                  {/* Options Grid */}
                  <div
                    className={isTimeout ? 'al-option-blur' : ''}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}
                  >
                    {currentQ.options.map((opt, idx) => {
                      let bg = 'rgba(242,242,242,0.05)';
                      let border = '1px solid rgba(242,242,242,0.18)';
                      let color = '#F2F2F2';

                      if (isAnswerChecked) {
                        if (idx === currentQ.correctIndex) {
                          bg = 'rgba(16,185,129,0.2)';
                          border = '1px solid #10B981';
                          color = '#10B981';
                        } else if (idx === selectedAnswer) {
                          bg = 'rgba(235,16,75,0.25)';
                          border = '1px solid #EB104B';
                          color = '#EB104B';
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
                            padding: '16px 20px',
                            textAlign: 'left',
                            fontFamily: 'var(--font-content)',
                            fontSize: '15px',
                            lineHeight: 1.4,
                            cursor: isAnswerChecked ? 'default' : 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                          onMouseEnter={(e) => {
                            if (!isAnswerChecked) e.currentTarget.style.borderColor = 'rgba(242,242,242,0.5)';
                          }}
                          onMouseLeave={(e) => {
                            if (!isAnswerChecked) e.currentTarget.style.borderColor = 'rgba(242,242,242,0.18)';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span
                              style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: '12px',
                                color: 'rgba(242,242,242,0.4)',
                                marginRight: '10px',
                              }}
                            >
                              {['A', 'B', 'C', 'D'][idx]}.
                            </span>
                            <span>{formatMathText(opt)}</span>
                          </div>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '10px',
                              color: 'rgba(242,242,242,0.3)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'rgba(242,242,242,0.06)',
                            }}
                          >
                            [{idx + 1}]
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Stamp Drop-In on Mistake or Timeout */}
                {isAnswerChecked && (isWrong || isTimeout) && (
                  <div
                    className="animate-stamp"
                    style={{
                      position: 'absolute',
                      top: '38%',
                      left: '50%',
                      transform: 'translate(-50%, -50%) rotate(-6deg)',
                      border: `3px solid ${isWrong ? '#EB104B' : '#F2F2F2'}`,
                      borderRadius: '8px',
                      padding: '10px 24px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '28px',
                      letterSpacing: '4px',
                      color: isWrong ? '#EB104B' : '#F2F2F2',
                      background: 'rgba(0,0,0,0.85)',
                      boxShadow: `0 0 25px ${isWrong ? 'rgba(235,16,75,0.4)' : 'rgba(242,242,242,0.4)'}`,
                      pointerEvents: 'none',
                      zIndex: 30,
                    }}
                  >
                    {isTimeout ? "TIME'S UP" : 'MISTAKE'}
                  </div>
                )}
              </div>

              {/* ── BACK FACE: Detailed Solution & Retention Scoring ── */}
              <div
                className="flashcard-face flashcard-back"
                style={{
                  background: 'linear-gradient(135deg, rgba(20,20,22,0.98), rgba(12,12,14,0.95))',
                  border: isCorrect
                    ? '1px solid #10B981'
                    : isWrong
                    ? '1px solid #EB104B'
                    : '1px solid rgba(242,242,242,0.25)',
                  borderRadius: '20px',
                  padding: '32px',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(242,242,242,0.22)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box',
                }}
              >
                <div>
                  {/* Status outcome banner */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px',
                      paddingBottom: '12px',
                      borderBottom: '1px solid rgba(242,242,242,0.10)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '13px',
                        letterSpacing: '2px',
                        color: isCorrect ? '#10B981' : '#EB104B',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {isCorrect ? '✓ CORRECT ANSWER' : '✗ REVIEW CONCEPTION'}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-subheading)',
                        fontSize: '11px',
                        color: 'rgba(242,242,242,0.4)',
                        letterSpacing: '1px',
                      }}
                    >
                      ANSWER: {['A', 'B', 'C', 'D'][currentQ.correctIndex]}
                    </span>
                  </div>

                  {/* Correct Option Highlight */}
                  <div
                    style={{
                      background: 'rgba(242,242,242,0.06)',
                      border: '1px solid rgba(242,242,242,0.18)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      marginBottom: '20px',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '11px',
                        color: 'rgba(242,242,242,0.5)',
                        marginBottom: '4px',
                      }}
                    >
                      VERIFIED FORMULA / STATEMENT:
                    </div>
                    <div style={{ fontFamily: 'var(--font-content)', fontSize: '15px', color: '#F2F2F2' }}>
                      {formatMathText(currentQ.options[currentQ.correctIndex])}
                    </div>
                  </div>

                  {/* Step-by-Step Textbook Derivation */}
                  <div>
                    <h4
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '12px',
                        letterSpacing: '1.5px',
                        color: 'rgba(242,242,242,0.6)',
                        margin: '0 0 8px',
                      }}
                    >
                      💡 TEXTBOOK EXPLANATION & DERIVATION:
                    </h4>
                    <p
                      style={{
                        fontFamily: 'var(--font-content)',
                        fontSize: '14px',
                        lineHeight: 1.6,
                        color: 'rgba(242,242,242,0.88)',
                        margin: 0,
                      }}
                    >
                      {formatMathText(currentQ.explanation)}
                    </p>
                  </div>
                </div>

                {/* Spaced-Repetition Grade Bar (Kokonut UI) */}
                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(242,242,242,0.10)' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-subheading)',
                        fontSize: '10px',
                        letterSpacing: '1.5px',
                        color: 'rgba(242,242,242,0.4)',
                      }}
                    >
                      SELF RETENTION GRADING (SPACED REPETITION)
                    </span>
                    <span style={{ fontSize: '10px', color: 'rgba(242,242,242,0.4)', fontFamily: 'monospace' }}>
                      Press [Space] to Continue
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    <button
                      onClick={() => handleRateRetention('again')}
                      style={{
                        background: 'rgba(235,16,75,0.12)',
                        border: '1px solid rgba(235,16,75,0.4)',
                        borderRadius: '8px',
                        padding: '10px 4px',
                        color: '#EB104B',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      AGAIN (1m)
                    </button>
                    <button
                      onClick={() => handleRateRetention('hard')}
                      style={{
                        background: 'rgba(242,242,242,0.06)',
                        border: '1px solid rgba(242,242,242,0.2)',
                        borderRadius: '8px',
                        padding: '10px 4px',
                        color: '#F2F2F2',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      HARD (6m)
                    </button>
                    <button
                      onClick={() => handleRateRetention('good')}
                      style={{
                        background: 'rgba(242,242,242,0.06)',
                        border: '1px solid rgba(242,242,242,0.2)',
                        borderRadius: '8px',
                        padding: '10px 4px',
                        color: '#F2F2F2',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      GOOD (1d)
                    </button>
                    <button
                      onClick={() => handleRateRetention('easy')}
                      style={{
                        background: 'rgba(16,185,129,0.12)',
                        border: '1px solid rgba(16,185,129,0.4)',
                        borderRadius: '8px',
                        padding: '10px 4px',
                        color: '#10B981',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      EASY (4d)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick HUD Navigation Hint */}
          <div
            style={{
              marginTop: '16px',
              fontFamily: 'var(--font-subheading)',
              fontSize: '11px',
              color: 'rgba(242,242,242,0.3)',
              letterSpacing: '1px',
              display: 'flex',
              gap: '16px',
            }}
          >
            <span>[1-4] or [A-D] Select</span>
            <span>•</span>
            <span>[Space] Flip / Continue</span>
            <span>•</span>
            <span>[ESC] Exit</span>
          </div>
        </div>
      )}

      {/* ── Phase 3.5: Canvas Particle-Wither on Failure ─────────────────── */}
      {phase === 'wither' && <WitherCanvas />}

      {/* ── Phase 4: Game Over & Review ─────────────────────────────────── */}
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
