import React, { useEffect, useRef, useState } from 'react';

export type CountdownPhase = 3 | 2 | 1 | 'GO' | 'done';

export interface CountdownSpec {
  word: string;
  caption?: string;
  label?: string;
}

interface QuizCountdownProps {
  onComplete?: () => void;
  runId?: number;
  active?: boolean;
  specs?: [CountdownSpec, CountdownSpec, CountdownSpec];
}

const STEPS: CountdownPhase[] = [3, 2, 1, 'GO'];

const PHASE_LABELS: Record<Exclude<CountdownPhase, 'done'>, { label: string; accent: string }> = {
  3: { label: 'GET READY', accent: '#F2F2F2' },
  2: { label: 'TIME CONTROL', accent: '#F2F2F2' },
  1: { label: 'DIFFICULTY', accent: '#F2F2F2' },
  GO: { label: '', accent: '#FFFFFF' },
};

const DEFAULT_SPECS: [CountdownSpec, CountdownSpec, CountdownSpec] = [
  { label: 'SUBJECT', word: 'PHYSICS', caption: 'Electrostatics • Unit 1' },
  { label: 'TIME CONTROL', word: 'TIMED', caption: '25s Speed Bonus Active' },
  { label: 'DIFFICULTY', word: 'CLASSIC', caption: '3 Hearts Allowed' },
];

export const QuizCountdown: React.FC<QuizCountdownProps> = ({
  onComplete,
  runId = 0,
  active = true,
  specs = DEFAULT_SPECS,
}) => {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [prevRunId, setPrevRunId] = useState(runId);

  if (runId !== prevRunId) {
    setPrevRunId(runId);
    setIndex(0);
    setDone(false);
  }

  const completeRef = useRef(onComplete);
  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!active || done) return;
    const currentStep = STEPS[index];
    const isGoStep = currentStep === 'GO';
    const hold = isGoStep ? 900 : 1000;
    const timer = setTimeout(() => {
      if (isGoStep) {
        setDone(true);
        completeRef.current?.();
      } else {
        setIndex((i) => i + 1);
      }
    }, hold);

    return () => clearTimeout(timer);
  }, [index, active, done]);

  if (!active || done) return null;

  const current = STEPS[index] as Exclude<CountdownPhase, 'done'>;
  const labels = PHASE_LABELS[current];
  const isGo = current === 'GO';
  const specIndex = index <= 2 ? index : 0;
  const spec = !isGo ? specs[specIndex] : null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none',
        background: '#000000',
        animation: isGo ? 'al-shake 0.4s ease-in-out' : 'none',
      }}
    >
      {/* 1. Deep Monochrome Grid Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundSize: '48px 48px',
          backgroundImage:
            'linear-gradient(to right, rgba(242, 242, 242, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(242, 242, 242, 0.04) 1px, transparent 1px)',
        }}
      />

      {/* 2. Center Radial Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(242, 242, 242, 0.12) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      {/* 3. Flash Pulse on each number */}
      <div
        key={`flash-${index}`}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.24) 0%, transparent 60%)',
          animation: 'al-flash 0.45s ease-out forwards',
          pointerEvents: 'none',
        }}
      />

      {/* 4. Horizontal Speed Streaks */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              height: '2px',
              top: `${14 + i * 18}%`,
              left: 0,
              width: `${30 + i * 10}%`,
              borderRadius: '9999px',
              background: 'linear-gradient(90deg, transparent, rgba(242, 242, 242, 0.85), transparent)',
              boxShadow: '0 0 12px rgba(242, 242, 242, 0.6)',
              animation: 'al-streak 1s linear forwards',
              animationDelay: `${i * 0.1}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      {/* 5. Expanding Radiant Rings */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        {[0, 0.35].map((delay) => (
          <div
            key={delay}
            style={{
              position: 'absolute',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              border: '2px solid rgba(242, 242, 242, 0.65)',
              boxShadow: '0 0 32px rgba(242, 242, 242, 0.45), inset 0 0 20px rgba(242, 242, 242, 0.2)',
              animation: 'al-ring-expand 1s ease-out forwards',
              animationDelay: `${delay}s`,
            }}
          />
        ))}
      </div>

      {/* 6. Rotating Accent Orbit Rings */}
      <div
        style={{
          position: 'absolute',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          border: '1px solid rgba(242, 242, 242, 0.25)',
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          boxShadow: '0 0 20px rgba(242, 242, 242, 0.15)',
          animation: 'al-spin-slow 6s linear infinite',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          border: '1px solid rgba(242, 242, 242, 0.18)',
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          boxShadow: '0 0 15px rgba(242, 242, 242, 0.12)',
          animation: 'al-spin-slow 4s linear infinite reverse',
          pointerEvents: 'none',
        }}
      />

      {/* 7. Label Above Number */}
      {!isGo && (
        <div
          key={`label-${index}`}
          style={{
            position: 'absolute',
            top: '28%',
            fontFamily: 'var(--font-subheading)',
            fontSize: '13px',
            fontWeight: 'bold',
            letterSpacing: '5px',
            color: '#F2F2F2',
            textShadow: '0 0 14px rgba(242, 242, 242, 0.65)',
            textTransform: 'uppercase',
            animation: 'al-fade-up 0.4s ease-out forwards',
          }}
        >
          {spec?.label || labels.label}
        </div>
      )}

      {/* 8. Main Number / GO! with Radiant Glow */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isGo ? (
          <div
            key="go"
            style={{
              textAlign: 'center',
              animation: 'al-go-pop 0.85s cubic-bezier(0.2, 1.4, 0.4, 1) forwards',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(80px, 18vw, 190px)',
                lineHeight: 1,
                fontWeight: 900,
                letterSpacing: '4px',
                color: '#FFFFFF',
                textShadow: '0 0 25px rgba(255, 255, 255, 1), 0 0 50px rgba(242, 242, 242, 0.8), 0 0 85px rgba(242, 242, 242, 0.4)',
              }}
            >
              GO!
            </div>
            {/* Sweep-shine underline bar */}
            <div
              style={{
                position: 'relative',
                margin: '12px auto 0',
                height: '4px',
                width: '75%',
                borderRadius: '4px',
                overflow: 'hidden',
                background: '#F2F2F2',
                boxShadow: '0 0 20px rgba(255, 255, 255, 0.85), 0 0 40px rgba(242, 242, 242, 0.5)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, transparent, #FFFFFF, transparent)',
                  animation: 'al-bar-sweep 1.2s ease-in-out infinite',
                }}
              />
            </div>
          </div>
        ) : (
          <div
            key={`num-${index}`}
            style={{
              position: 'relative',
              animation: 'al-number-pop 1s cubic-bezier(0.16, 1.06, 0.43, 0.99) forwards',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(110px, 24vw, 220px)',
                lineHeight: 1,
                fontWeight: 900,
                color: '#FFFFFF',
                textShadow: '0 0 20px rgba(255, 255, 255, 0.95), 0 0 45px rgba(242, 242, 242, 0.65), 0 0 75px rgba(242, 242, 242, 0.35)',
              }}
            >
              {current}
            </div>

            {/* Spec Word Fly-Out */}
            {spec && (
              <div
                key={`spec-${index}`}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '100%',
                  marginLeft: '24px',
                  transform: 'translateY(-50%)',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  animation: 'al-fly-out 1s cubic-bezier(0.18, 0.9, 0.3, 1) forwards',
                }}
              >
                {/* Fly-out speed line */}
                <div
                  style={{
                    height: '2px',
                    width: '65px',
                    marginBottom: '6px',
                    borderRadius: '2px',
                    background: 'linear-gradient(90deg, #F2F2F2, transparent)',
                    boxShadow: '0 0 10px rgba(242, 242, 242, 0.6)',
                    animation: 'al-fly-out-streak 1s ease-out forwards',
                  }}
                />
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(20px, 3.5vw, 42px)',
                    fontWeight: 900,
                    letterSpacing: '2px',
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    textShadow: '0 0 16px rgba(255, 255, 255, 0.85), 0 0 35px rgba(242, 242, 242, 0.5)',
                  }}
                >
                  {spec.word}
                </div>
                {spec.caption && (
                  <div
                    style={{
                      fontFamily: 'var(--font-subheading)',
                      fontSize: '11px',
                      letterSpacing: '2px',
                      color: 'rgba(242, 242, 242, 0.8)',
                      marginTop: '4px',
                      textTransform: 'uppercase',
                      textShadow: '0 0 8px rgba(242, 242, 242, 0.4)',
                    }}
                  >
                    {spec.caption}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 9. Bottom Progress Ticks */}
      <div
        style={{
          position: 'absolute',
          bottom: '36px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          gap: '10px',
        }}
      >
        {STEPS.map((s, i) => (
          <div
            key={s}
            style={{
              height: '4px',
              borderRadius: '4px',
              transition: 'all 0.3s ease',
              width: i === index ? '40px' : '20px',
              background: i <= index ? '#F2F2F2' : 'rgba(242, 242, 242, 0.2)',
              boxShadow: i <= index ? '0 0 12px rgba(242, 242, 242, 0.8)' : 'none',
            }}
          />
        ))}
      </div>

      {/* 10. Corner L-Shaped HUD Brackets */}
      <div
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          width: '36px',
          height: '36px',
          borderLeft: '2px solid rgba(242, 242, 242, 0.6)',
          borderTop: '2px solid rgba(242, 242, 242, 0.6)',
          borderTopLeftRadius: '10px',
          boxShadow: '0 0 12px rgba(242, 242, 242, 0.3)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          width: '36px',
          height: '36px',
          borderRight: '2px solid rgba(242, 242, 242, 0.6)',
          borderTop: '2px solid rgba(242, 242, 242, 0.6)',
          borderTopRightRadius: '10px',
          boxShadow: '0 0 12px rgba(242, 242, 242, 0.3)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '24px',
          width: '36px',
          height: '36px',
          borderLeft: '2px solid rgba(242, 242, 242, 0.6)',
          borderBottom: '2px solid rgba(242, 242, 242, 0.6)',
          borderBottomLeftRadius: '10px',
          boxShadow: '0 0 12px rgba(242, 242, 242, 0.3)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          width: '36px',
          height: '36px',
          borderRight: '2px solid rgba(242, 242, 242, 0.6)',
          borderBottom: '2px solid rgba(242, 242, 242, 0.6)',
          borderBottomRightRadius: '10px',
          boxShadow: '0 0 12px rgba(242, 242, 242, 0.3)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default QuizCountdown;
