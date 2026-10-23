import React, { useEffect, useRef } from 'react';
import { getWaveCharge } from '../lib/waveCharge';

interface GlowingTitleProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  fontSize?: string;
  letterSpacing?: string;
}

/**
 * GlowingTitle
 *
 * Dynamically modulates pure white text shadow and brightness based on real-time
 * particle wave charge flowing through the center of the title.
 * Operates at 60fps via requestAnimationFrame without triggering React re-renders or layout thrashing.
 */
export const GlowingTitle: React.FC<GlowingTitleProps> = ({
  text,
  className,
  style,
  fontSize = 'clamp(24px, 2.6vw, 42px)',
  letterSpacing = '6px',
}) => {
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const smoothedChargeRef = useRef<number>(0.2);
  const centerRef = useRef<{ cx: number; cy: number }>({ cx: window.innerWidth / 2, cy: window.innerHeight / 2 });

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;

    const measureCenter = () => {
      const rect = el.getBoundingClientRect();
      centerRef.current = {
        cx: rect.left + rect.width / 2,
        cy: rect.top + rect.height / 2,
      };
    };

    measureCenter();
    window.addEventListener('resize', measureCenter);

    const updateGlow = () => {
      const { cx, cy } = centerRef.current;

      // Sample particle wave density at the title's visual center
      const rawCharge = getWaveCharge(cx, cy);

      // Smooth progression (exponential moving average)
      smoothedChargeRef.current = smoothedChargeRef.current * 0.72 + rawCharge * 0.28;
      const charge = smoothedChargeRef.current;

      // Active glow factor (0.0 to 1.0)
      const glowFactor = Math.max(0, Math.min(1, (charge - 0.12) / 0.65));

      const isLight = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light';

      if (glowFactor > 0.04) {
        if (isLight) {
          el.style.color = '#111114';
          el.style.textShadow = `0 0 ${Math.round(10 * glowFactor)}px rgba(0, 153, 255, ${0.5 * glowFactor}), 0 0 ${Math.round(24 * glowFactor)}px rgba(0, 153, 255, ${0.3 * glowFactor})`;
          el.style.filter = `drop-shadow(0 0 ${Math.round(12 * glowFactor)}px rgba(0, 153, 255, ${0.35 * glowFactor}))`;
        } else {
          el.style.color = '#F2F2F2';
          el.style.textShadow = `0 0 ${Math.round(12 * glowFactor)}px rgba(255, 255, 255, ${0.95 * glowFactor}), 0 0 ${Math.round(30 * glowFactor)}px rgba(255, 255, 255, ${0.72 * glowFactor}), 0 0 ${Math.round(52 * glowFactor)}px rgba(255, 255, 255, ${0.45 * glowFactor})`;
          el.style.filter = `brightness(${1 + 0.5 * glowFactor}) drop-shadow(0 0 ${Math.round(16 * glowFactor)}px rgba(255, 255, 255, ${0.85 * glowFactor}))`;
        }
      } else {
        el.style.color = isLight ? '#111114' : '#F2F2F2';
        el.style.textShadow = 'none';
        el.style.filter = 'none';
      }

      rafRef.current = requestAnimationFrame(updateGlow);
    };

    rafRef.current = requestAnimationFrame(updateGlow);

    return () => {
      window.removeEventListener('resize', measureCenter);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <h1
      ref={titleRef}
      className={`prismate-glowing-title ${className || ''}`}
      style={{
        fontFamily: 'var(--font-heading)',
        fontSize,
        color: 'var(--color-fg, #F2F2F2)',
        letterSpacing,
        textAlign: 'center',
        fontWeight: 'normal',
        margin: 0,
        userSelect: 'none',
        transition: 'color 0.15s ease',
        ...style,
      }}
    >
      {text}
    </h1>
  );
};

export default GlowingTitle;
