import React from 'react';

export interface PrismProps {
  /**
   * Dynamic wave density / particle charge (0.0 to 1.0).
   * 0.0: Base muted 3-faced isometric state from Logo.png
   * 1.0: Peak glow overload with intense Gem Violet (left) and Ruby Red (right) tint + radial bloom
   */
  waveCharge: number;
  /**
   * Flash / appear intensity multiplier (0.0 to 1.0).
   * Max on appear / lock-in, then smoothly dims down.
   */
  flashIntensity?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Prism: React.FC<PrismProps> = ({
  waveCharge,
  flashIntensity = 0,
  className,
  style,
}) => {
  const charge = Math.max(0, Math.min(1, waveCharge));
  const flash = Math.max(0, Math.min(1, flashIntensity));

  // Combined tint factor (wave charge + appear flash boost)
  const tintIntensity = Math.min(1, charge * 0.95 + flash);

  // Left face: interpolates from slate blue (#9FB1C8 / 159, 177, 200) to Gem Violet (#9D22FF / 157, 34, 255)
  const leftR = Math.round(159 + (157 - 159) * tintIntensity);
  const leftG = Math.round(177 + (34 - 177) * tintIntensity);
  const leftB = Math.round(200 + (255 - 200) * tintIntensity);
  const leftColor = `rgb(${leftR}, ${leftG}, ${leftB})`;

  // Right face: interpolates from deep navy (#121C36 / 18, 28, 54) to Ruby Red (#EB104B / 235, 16, 75)
  const rightR = Math.round(18 + (235 - 18) * tintIntensity);
  const rightG = Math.round(28 + (16 - 28) * tintIntensity);
  const rightB = Math.round(54 + (75 - 54) * tintIntensity);
  const rightColor = `rgb(${rightR}, ${rightG}, ${rightB})`;

  // Top cap: interpolates from dark slate (#3B4C6A / 59, 76, 106) to jewel highlight (#F2E6FF / 242, 230, 255)
  const capR = Math.round(59 + (242 - 59) * tintIntensity);
  const capG = Math.round(76 + (230 - 76) * tintIntensity);
  const capB = Math.round(106 + (255 - 106) * tintIntensity);
  const capColor = `rgb(${capR}, ${capG}, ${capB})`;

  // Bloom opacity: scales with tintIntensity and surges on flash
  const bloomOpacity = Math.min(1, tintIntensity * 1.25);

  const filterStyle =
    tintIntensity > 0.05
      ? `drop-shadow(0 0 ${Math.round(14 * tintIntensity)}px rgba(157, 34, 255, ${(0.9 * tintIntensity).toFixed(2)})) ` +
        `drop-shadow(0 0 ${Math.round(18 * tintIntensity)}px rgba(235, 16, 75, ${(0.9 * tintIntensity).toFixed(2)})) ` +
        `drop-shadow(0 0 ${Math.round(32 * tintIntensity)}px rgba(255, 240, 250, ${(0.75 * tintIntensity).toFixed(2)})) ` +
        `brightness(${(1 + 1.8 * flash).toFixed(2)})`
      : undefined;

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
      {/* High-Intensity Dual-Tone Outer Bloom (Gem Violet on left, Ruby Red on right) */}
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
            'radial-gradient(ellipse at 35% 50%, rgba(157, 34, 255, 0.8) 0%, transparent 65%), ' +
            'radial-gradient(ellipse at 65% 50%, rgba(235, 16, 75, 0.8) 0%, transparent 65%), ' +
            'radial-gradient(ellipse at 50% 50%, rgba(255, 235, 250, 0.6) 0%, transparent 45%)',
          transition: flash > 0 ? 'none' : 'opacity 0.12s linear',
        }}
        aria-hidden="true"
      />

      {/* Ultra-high flash core flare (fires during appear animation) */}
      {flash > 0.05 && (
        <div
          style={{
            position: 'absolute',
            inset: '-50%',
            opacity: flash,
            pointerEvents: 'none',
            zIndex: 1,
            background:
              'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.95) 0%, rgba(245, 210, 255, 0.7) 30%, transparent 70%)',
          }}
          aria-hidden="true"
        />
      )}

      {/* 3-Faced Isometric Prism with Direct Gem Violet & Ruby Red Tint (Zero center line) */}
      <svg
        viewBox="0 0 109 260"
        shapeRendering="geometricPrecision"
        xmlns="http://www.w3.org/2000/svg"
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
      >
        {/* Top triangular cap pointing down */}
        <polygon points="0,0 109,0 54.5,63" fill={capColor} />

        {/* Left face: tints dynamically from slate-blue to Gem Violet */}
        <polygon points="0,0 54.5,63 54.5,259 0,202" fill={leftColor} />

        {/* Right face: tints dynamically from deep navy to Ruby Red */}
        <polygon points="109,0 54.5,63 54.5,259 109,202" fill={rightColor} />
      </svg>
    </div>
  );
};

export default Prism;
