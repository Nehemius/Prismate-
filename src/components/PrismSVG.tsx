import React from 'react';

export interface PrismSVGProps {
  variant?: 'monolith' | 'glowing-cyan';
  className?: string;
  style?: React.CSSProperties;
}

export const PrismSVG: React.FC<PrismSVGProps> = ({
  variant = 'glowing-cyan',
  className = '',
  style,
}) => {
  const isGlowing = variant === 'glowing-cyan';

  return (
    <svg
      viewBox="0 0 220 420"
      className={`overflow-visible select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
    >
      <defs>
        {/* Shadowed Monolith Gradients (For Chiaroscuro Shadow Reveal) */}
        <linearGradient id="monolith-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E9EEF4" />
        </linearGradient>
        <linearGradient id="monolith-left" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8A99AD" />
          <stop offset="100%" stopColor="#6D7B8D" />
        </linearGradient>
        <linearGradient id="monolith-right" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#566375" />
          <stop offset="100%" stopColor="#3B4554" />
        </linearGradient>

        {/* Gorgeous Translucent Electric Cyan-Blue Glass Gradients */}
        <linearGradient id="gorgeous-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="55%" stopColor="#E6FFFF" stopOpacity="0.96" />
          <stop offset="100%" stopColor="#33F0FF" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="gorgeous-left" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E6FFFF" stopOpacity="0.82" />
          <stop offset="40%" stopColor="#33F0FF" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#00B8FF" stopOpacity="0.48" />
        </linearGradient>
        <linearGradient id="gorgeous-right" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#33F0FF" stopOpacity="0.55" />
          <stop offset="50%" stopColor="#00B8FF" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#0055FF" stopOpacity="0.38" />
        </linearGradient>

        {/* Double-Layered Electric Cyan + Deep Cobalt Optical Glow */}
        <filter id="prism-gorgeous-glow" x="-60%" y="-40%" width="220%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#33F0FF" floodOpacity="0.85" />
          <feDropShadow dx="0" dy="0" stdDeviation="24" floodColor="#0055FF" floodOpacity="0.9" />
        </filter>
      </defs>

      <g filter={isGlowing ? 'url(#prism-gorgeous-glow)' : undefined}>
        {/* Top Triangle Cap: (20, 30) -> (200, 30) -> (110, 102) */}
        <polygon
          points="20,30 200,30 110,102"
          fill={isGlowing ? 'url(#gorgeous-top)' : 'url(#monolith-top)'}
          stroke={isGlowing ? '#E6FFFF' : '#FFFFFF'}
          strokeWidth={isGlowing ? 2 : 1}
          strokeLinejoin="round"
        />

        {/* Left Vertical Column Face */}
        <polygon
          points="20,30 110,102 110,390 20,318"
          fill={isGlowing ? 'url(#gorgeous-left)' : 'url(#monolith-left)'}
          stroke={isGlowing ? '#33F0FF' : 'none'}
          strokeWidth={isGlowing ? 1.5 : 0}
          strokeLinejoin="round"
        />

        {/* Right Vertical Column Face */}
        <polygon
          points="110,102 200,30 200,318 110,390"
          fill={isGlowing ? 'url(#gorgeous-right)' : 'url(#monolith-right)'}
          stroke={isGlowing ? '#00B8FF' : 'none'}
          strokeWidth={isGlowing ? 1.5 : 0}
          strokeLinejoin="round"
        />

        {/* Glowing Inner Spine & Rim Highlights */}
        {isGlowing && (
          <>
            <line
              x1="110"
              y1="102"
              x2="110"
              y2="390"
              stroke="#E6FFFF"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <polyline
              points="20,30 110,102 200,30"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.2"
            />
            <polyline
              points="20,318 110,390 200,318"
              fill="none"
              stroke="#33F0FF"
              strokeWidth="2"
            />
          </>
        )}
      </g>
    </svg>
  );
};

export default PrismSVG;
