import React from 'react';
import prUrl from '../assets/logo/PR_final.png';
import smateUrl from '../assets/logo/SMATE_final.png';

export interface PrismateLogoProps {
  className?: string;
  style?: React.CSSProperties;
  /** Opacity for the surrounding letters (PR and SMATE) */
  letterOpacity?: number;
  /** Flash intensity multiplier for appear animation (0 = normal, 1 = max ultra high flash) */
  appearFlash?: number;
  /** Dynamic wave density / particle charge (0.0 to 1.0) driving white glow on words */
  waveCharge?: number;
  /** Slot content (the Prism component) */
  children?: React.ReactNode;
}

export const PrismateLogo: React.FC<PrismateLogoProps> = ({
  className,
  style,
  letterOpacity = 1,
  appearFlash = 0,
  waveCharge = 0,
  children,
}) => {
  // Pure white glow driven by particle density when high
  const wordGlowFactor = Math.max(0, Math.min(1, (waveCharge - 0.15) / 0.75));

  // Determine letter filter style:
  // 1. Appear flash (ultra high blinding white flash)
  // 2. High particle density (white glow only)
  // 3. Resting (crisp #F2F2F2 with no filter)
  let letterFilter: string | undefined;

  if (appearFlash > 0.05) {
    letterFilter =
      `brightness(${1 + 2.6 * appearFlash}) ` +
      `drop-shadow(0 0 ${16 * appearFlash}px rgba(51, 240, 255, 1)) ` +
      `drop-shadow(0 0 ${36 * appearFlash}px rgba(0, 85, 255, 0.9)) ` +
      `drop-shadow(0 0 ${54 * appearFlash}px rgba(255, 255, 255, 0.85))`;
  } else if (wordGlowFactor > 0.05) {
    letterFilter =
      `drop-shadow(0 0 ${10 * wordGlowFactor}px rgba(51, 240, 255, ${0.9 * wordGlowFactor})) ` +
      `drop-shadow(0 0 ${24 * wordGlowFactor}px rgba(0, 85, 255, ${0.75 * wordGlowFactor}))`;
  }

  const letterStyle: React.CSSProperties = {
    opacity: letterOpacity,
    filter: letterFilter,
    transition: appearFlash > 0 ? 'none' : 'filter 0.12s linear, opacity 0.25s ease',
  };

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '840px',
        aspectRatio: '1036 / 260',
        display: 'flex',
        alignItems: 'stretch',
        userSelect: 'none',
        ...style,
      }}
    >
      {/* PR Letters (319 / 1036 = 30.7915%) — Ultra-High Resolution 4x Supersampled */}
      <div
        style={{
          width: '30.7915%',
          height: '100%',
          position: 'relative',
          ...letterStyle,
        }}
      >
        <img
          src={prUrl}
          alt="PR"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            pointerEvents: 'none',
            imageRendering: 'auto',
          }}
        />
      </div>

      {/* Designated Slot for the 3D Prism (109 / 1036 = 10.5212%) */}
      <div
        data-prism-slot
        style={{
          width: '10.5212%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5,
        }}
      >
        {children}
      </div>

      {/* SMATE Letters (608 / 1036 = 58.6873%) — Ultra-High Resolution 4x Supersampled */}
      <div
        style={{
          width: '58.6873%',
          height: '100%',
          position: 'relative',
          ...letterStyle,
        }}
      >
        <img
          src={smateUrl}
          alt="SMATE"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            pointerEvents: 'none',
            imageRendering: 'auto',
          }}
        />
      </div>
    </div>
  );
};

export default PrismateLogo;
