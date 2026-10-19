import React, { useEffect, useRef, useState } from 'react';
import './UniversalLoader.css';

interface LoaderKeyframe {
  rInner: number;
  dTheta: number;
}

const R_OUTER = 85;
const TWO_PI_OVER_5 = (2 * Math.PI) / 5;
const HALF_PI = Math.PI / 2;
const PI_OVER_5 = Math.PI / 5;

const KEYFRAMES: LoaderKeyframe[] = [
  { rInner: 35, dTheta: 0.0 },
  { rInner: 52, dTheta: 0.65 },
  { rInner: 68, dTheta: 1.85 },
  { rInner: 45, dTheta: -0.95 },
  { rInner: 35, dTheta: 0.0 },
];

const SEGMENT_DURATION = 1200; // ms per transition (4.8s total cycle)
const TOTAL_DURATION = SEGMENT_DURATION * (KEYFRAMES.length - 1);

function easeInOutSine(x: number): number {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}

function computePoints(rInner: number, dTheta: number): string {
  const pts: string[] = [];
  for (let k = 0; k < 5; k++) {
    const thetaOuter = k * TWO_PI_OVER_5 - HALF_PI;
    const xOuter = R_OUTER * Math.cos(thetaOuter);
    const yOuter = R_OUTER * Math.sin(thetaOuter);
    pts.push(`${xOuter.toFixed(2)},${yOuter.toFixed(2)}`);

    const thetaInner = k * TWO_PI_OVER_5 - HALF_PI + PI_OVER_5 + dTheta;
    const xInner = rInner * Math.cos(thetaInner);
    const yInner = rInner * Math.sin(thetaInner);
    pts.push(`${xInner.toFixed(2)},${yInner.toFixed(2)}`);
  }
  return pts.join(' ');
}

// Global continuous time origin shared across all mounts/unmounts
// Ensures the star polygon animation continues seamlessly without resetting
let globalLoaderTimeOrigin: number | null = null;

export interface UniversalLoaderMetadata {
  subject?: string;
  filter?: string;
  difficulty?: string;
}

export interface UniversalLoaderProps {
  visible?: boolean;
  className?: string;
  style?: React.CSSProperties;
  metadata?: UniversalLoaderMetadata;
}

export const UniversalLoader: React.FC<UniversalLoaderProps> = ({
  visible = true,
  className = '',
  style = {},
  metadata,
}) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const polygonRef = useRef<SVGPolygonElement | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const [isDisplayed, setIsDisplayed] = useState<boolean>(visible);
  const [prevVisible, setPrevVisible] = useState<boolean>(visible);

  // If visible transitions from false to true, ensure overlay is displayed immediately
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) {
      setIsDisplayed(true);
    }
  }

  const startAnimation = () => {
    if (rafIdRef.current !== null) return;

    const render = (timestamp: number) => {
      if (globalLoaderTimeOrigin === null) {
        globalLoaderTimeOrigin = timestamp;
      }
      // Continuous modulo over the 4.8s cycle — never resets
      const elapsed = (timestamp - globalLoaderTimeOrigin) % TOTAL_DURATION;
      const segIndex = Math.min(
        Math.floor(elapsed / SEGMENT_DURATION),
        KEYFRAMES.length - 2
      );
      const localProgress = (elapsed - segIndex * SEGMENT_DURATION) / SEGMENT_DURATION;
      const eased = easeInOutSine(localProgress);

      const from = KEYFRAMES[segIndex];
      const to = KEYFRAMES[segIndex + 1];

      const currentR = from.rInner + (to.rInner - from.rInner) * eased;
      const currentTheta = from.dTheta + (to.dTheta - from.dTheta) * eased;

      if (polygonRef.current) {
        polygonRef.current.setAttribute('points', computePoints(currentR, currentTheta));
      }

      rafIdRef.current = requestAnimationFrame(render);
    };

    rafIdRef.current = requestAnimationFrame(render);
  };

  const stopAnimation = () => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

  useEffect(() => {
    if (visible) {
      startAnimation();
    } else {
      const timer = setTimeout(() => {
        setIsDisplayed(false);
        stopAnimation();
      }, 450);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [visible]);

  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, []);

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current && e.propertyName === 'opacity' && !visible) {
      setIsDisplayed(false);
      stopAnimation();
    }
  };

  const hiddenClass = !visible ? 'is-hidden' : '';

  return (
    <div
      ref={overlayRef}
      id="prismateLoader"
      className={`prismate-loader-overlay ${hiddenClass} ${className}`.trim()}
      style={{
        display: isDisplayed ? 'block' : 'none',
        ...style,
      }}
      onTransitionEnd={handleTransitionEnd}
    >
      {metadata && (
        <div
          style={{
            position: 'fixed',
            bottom: '96px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            pointerEvents: 'none',
            textAlign: 'center',
          }}
        >
          {metadata.subject && (
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '14px',
                letterSpacing: '3px',
                color: '#F2F2F2',
                textTransform: 'uppercase',
              }}
            >
              {metadata.subject}
            </span>
          )}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {metadata.filter && (
              <span
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '11px',
                  letterSpacing: '1px',
                  color: 'rgba(242, 242, 242, 0.6)',
                  textTransform: 'uppercase',
                }}
              >
                {metadata.filter}
              </span>
            )}
            {metadata.filter && metadata.difficulty && (
              <span style={{ color: 'rgba(242, 242, 242, 0.3)' }}>•</span>
            )}
            {metadata.difficulty && (
              <span
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '11px',
                  letterSpacing: '1px',
                  color: 'rgba(242, 242, 242, 0.6)',
                  textTransform: 'uppercase',
                }}
              >
                {metadata.difficulty}
              </span>
            )}
          </div>
        </div>
      )}

      <svg
        className="prismate-loader-icon"
        viewBox="-100 -100 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon
          ref={polygonRef}
          id="inkscapeStar"
          fill="#F2F2F2"
          fillRule="evenodd"
          points={computePoints(35, 0.0)}
        />
      </svg>
    </div>
  );
};

export default UniversalLoader;
