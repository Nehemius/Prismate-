import React from 'react';
import PrismSVG from './PrismSVG';

export interface PrismProps {
  /**
   * Dynamic wave density / particle charge (0.0 to 1.0).
   * 0.0: Base electric blue crystal state
   * 1.0: Peak glow overload with intense cyan and cobalt flare + outer bloom
   */
  waveCharge: number;
  /**
   * Flash / appear intensity multiplier (0.0 to 1.0).
   * Max on appear / lock-in, then smoothly dims down.
   */
  flashIntensity?: number;
  variant?: 'monolith' | 'glowing-cyan';
  className?: string;
  style?: React.CSSProperties;
}

export const Prism: React.FC<PrismProps> = ({
  waveCharge,
  flashIntensity = 0,
  variant = 'glowing-cyan',
  className,
  style,
}) => {
  const charge = Math.max(0, Math.min(1, waveCharge));
  const flash = Math.max(0, Math.min(1, flashIntensity));

  // Combined tint factor (wave charge + appear flash boost)
  const tintIntensity = Math.min(1, charge * 0.95 + flash);

  // Dynamic filter boost for peak wave / appear flash
  const cyanGlow1 = Math.round(10 + 16 * tintIntensity);
  const cobaltGlow2 = Math.round(24 + 28 * tintIntensity);
  const whiteGlow3 = Math.round(36 * tintIntensity);

  const filterStyle =
    variant === 'glowing-cyan'
      ? `drop-shadow(0 0 ${cyanGlow1}px rgba(51, 240, 255, ${(0.85 + 0.15 * tintIntensity).toFixed(2)})) ` +
        `drop-shadow(0 0 ${cobaltGlow2}px rgba(0, 85, 255, 0.9))` +
        (tintIntensity > 0.15
          ? ` drop-shadow(0 0 ${whiteGlow3}px rgba(255, 255, 255, ${(0.85 * tintIntensity).toFixed(2)}))`
          : '') +
        (flash > 0.05 ? ` brightness(${(1 + 1.5 * flash).toFixed(2)})` : '')
      : undefined;

  // Bloom opacity: base subtle cyan aura, surges with waveCharge / flash
  const bloomOpacity = variant === 'glowing-cyan' ? Math.min(1, 0.45 + tintIntensity * 0.65) : 0;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        ...style,
      }}
    >
      {/* High-Intensity Electric Cyan & Deep Cobalt Outer Bloom */}
      {variant === 'glowing-cyan' && (
        <div
          style={{
            position: 'absolute',
            top: '-35%',
            left: '-80%',
            width: '260%',
            height: '170%',
            opacity: bloomOpacity,
            pointerEvents: 'none',
            zIndex: 0,
            background:
              'radial-gradient(ellipse at 35% 50%, rgba(51, 240, 255, 0.85) 0%, transparent 65%), ' +
              'radial-gradient(ellipse at 65% 50%, rgba(0, 85, 255, 0.85) 0%, transparent 65%), ' +
              'radial-gradient(ellipse at 50% 50%, rgba(230, 255, 255, 0.7) 0%, transparent 45%)',
            transition: flash > 0 ? 'none' : 'opacity 0.12s linear',
          }}
          aria-hidden="true"
        />
      )}

      {/* Ultra-high flash core flare (fires during appear animation) */}
      {flash > 0.05 && variant === 'glowing-cyan' && (
        <div
          style={{
            position: 'absolute',
            inset: '-50%',
            opacity: flash,
            pointerEvents: 'none',
            zIndex: 1,
            background:
              'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.98) 0%, rgba(200, 245, 255, 0.85) 30%, transparent 70%)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Prism SVG Geometry */}
      <PrismSVG
        variant={variant}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          display: 'block',
          pointerEvents: 'none',
          filter: filterStyle,
          transition: flash > 0 ? 'none' : 'filter 0.12s linear',
        }}
      />
    </div>
  );
};

export default Prism;
