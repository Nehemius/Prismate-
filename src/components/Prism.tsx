import React from 'react';

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

  // Dynamic filter with base Electric Blue glow + boost on wave/flash
  const cyanGlow1 = Math.round(10 + 16 * tintIntensity);
  const cobaltGlow2 = Math.round(26 + 28 * tintIntensity);
  const whiteGlow3 = Math.round(36 * tintIntensity);

  const filterStyle =
    `drop-shadow(0 0 ${cyanGlow1}px rgba(51, 240, 255, ${(0.88 + 0.12 * tintIntensity).toFixed(2)})) ` +
    `drop-shadow(0 0 ${cobaltGlow2}px rgba(0, 85, 255, ${(0.92).toFixed(2)}))` +
    (tintIntensity > 0.15
      ? ` drop-shadow(0 0 ${whiteGlow3}px rgba(255, 255, 255, ${(0.85 * tintIntensity).toFixed(2)}))`
      : '') +
    (flash > 0.05 ? ` brightness(${(1 + 1.6 * flash).toFixed(2)})` : '');

  // Bloom opacity: base subtle cyan aura, surges with waveCharge / flash
  const bloomOpacity = Math.min(1, 0.45 + tintIntensity * 0.65);

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
              'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.98) 0%, rgba(200, 245, 255, 0.85) 30%, transparent 70%)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Full Translucent Electric Cyan-Blue Crystal Prism SVG */}
      <svg
        viewBox="0 0 220 420"
        shapeRendering="geometricPrecision"
        className="overflow-visible select-none"
        fill="none"
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
        <defs>
          {/* Top Translucent White-Cyan Cap Gradient */}
          <linearGradient id="gorgeous-top" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="55%" stopColor="#E6FFFF" stopOpacity="0.98" />
            <stop offset="100%" stopColor="#33F0FF" stopOpacity="0.92" />
          </linearGradient>

          {/* Left Electric Cyan-Blue Glass Face */}
          <linearGradient id="gorgeous-left" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E6FFFF" stopOpacity="0.95" />
            <stop offset="38%" stopColor="#33F0FF" stopOpacity="0.82" />
            <stop offset="100%" stopColor="#00B8FF" stopOpacity="0.62" />
          </linearGradient>

          {/* Right Deep Cobalt-Cyan Glass Face */}
          <linearGradient id="gorgeous-right" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#33F0FF" stopOpacity="0.78" />
            <stop offset="50%" stopColor="#00B8FF" stopOpacity="0.58" />
            <stop offset="100%" stopColor="#0055FF" stopOpacity="0.48" />
          </linearGradient>
        </defs>

        <g>
          {/* Outer Cobalt-Cyan Optical Halo Polygon */}
          <polygon
            points="12,24 208,24 208,322 110,400 12,322"
            fill="#0055FF"
            fillOpacity="0.22"
            stroke="#00B8FF"
            strokeOpacity="0.35"
            strokeWidth="6"
            strokeLinejoin="round"
          />

          {/* Top White/Cyan Triangle Cap: (20, 30) -> (200, 30) -> (110, 102) */}
          <polygon
            points="20,30 200,30 110,102"
            fill="url(#gorgeous-top)"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Left Vertical Column Face: (20, 30) -> (110, 102) -> (110, 390) -> (20, 318) */}
          <polygon
            points="20,30 110,102 110,390 20,318"
            fill="url(#gorgeous-left)"
            stroke="#E6FFFF"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Right Vertical Column Face: (110, 102) -> (200, 30) -> (200, 318) -> (110, 390) */}
          <polygon
            points="110,102 200,30 200,318 110,390"
            fill="url(#gorgeous-right)"
            stroke="#33F0FF"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Internal Crystalline Diagonal Refraction Planes */}
          <polygon
            points="20,95 110,167 110,222 20,150"
            fill="#FFFFFF"
            fillOpacity="0.38"
          />
          <polygon
            points="110,167 200,95 200,142 110,214"
            fill="#E6FFFF"
            fillOpacity="0.30"
          />
          <polygon
            points="20,210 110,282 110,320 20,248"
            fill="#E6FFFF"
            fillOpacity="0.32"
          />
          <polygon
            points="110,255 200,183 200,225 110,297"
            fill="#33F0FF"
            fillOpacity="0.28"
          />

          {/* Blinding White Central Vertical Spine & V-Edges */}
          <line
            x1="110"
            y1="102"
            x2="110"
            y2="390"
            stroke="#FFFFFF"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <polyline
            points="20,30 110,102 200,30"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.8"
          />
          <polyline
            points="20,318 110,390 200,318"
            fill="none"
            stroke="#E6FFFF"
            strokeWidth="2.4"
          />
        </g>
      </svg>
    </div>
  );
};

export default Prism;
