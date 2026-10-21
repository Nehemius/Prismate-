import React, { useState, useEffect } from 'react';

/**
 * OrientationGuard — Enforces Horizontal / Landscape Mode on Mobile & Tablet
 *
 * SPECIFICATION:
 *   - Detects if mobile/tablet user is holding device in vertical/portrait mode.
 *   - Renders a sleek, high-contrast Prismate monochrome overlay blocking the screen.
 *   - Continuous smooth phone tilt animation prompting the user to rotate horizontally.
 *   - Automatically unlocks as soon as the device is tilted horizontal.
 */
export const OrientationGuard: React.FC = () => {
  const [isPortrait, setIsPortrait] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmall = window.innerWidth <= 1024;
    return isTouch && window.innerHeight > window.innerWidth && isSmall;
  });

  useEffect(() => {
    const checkOrientation = () => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmall = window.innerWidth <= 1024;
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(isTouch && portrait && isSmall);
    };

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    checkOrientation();

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortrait) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999999,
        background: '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        boxSizing: 'border-box',
        userSelect: 'none',
        textAlign: 'center',
      }}
    >
      <style>{`
        @keyframes prism-phone-tilt {
          0%, 15% {
            transform: rotate(0deg);
          }
          45%, 75% {
            transform: rotate(-90deg);
          }
          90%, 100% {
            transform: rotate(0deg);
          }
        }
        @keyframes prism-pulse-ring {
          0% {
            transform: scale(0.9);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.2;
          }
          100% {
            transform: scale(0.9);
            opacity: 0.8;
          }
        }
      `}</style>

      {/* Animated Phone Tilt Graphic */}
      <div
        style={{
          position: 'relative',
          width: '120px',
          height: '120px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Pulsing Rotation Indicator Glow Ring */}
        <div
          style={{
            position: 'absolute',
            inset: '-10px',
            borderRadius: '50%',
            border: '1.5px dashed rgba(242, 242, 242, 0.25)',
            animation: 'prism-pulse-ring 2.8s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        {/* Smartphone Outline SVG tilting 90 degrees */}
        <svg
          viewBox="0 0 80 140"
          style={{
            width: '64px',
            height: '112px',
            animation: 'prism-phone-tilt 2.8s cubic-bezier(0.65, 0, 0.35, 1) infinite',
            transformOrigin: 'center center',
            overflow: 'visible',
            filter: 'drop-shadow(0 0 16px rgba(255, 255, 255, 0.35))',
          }}
        >
          {/* Phone body */}
          <rect
            x="4"
            y="4"
            width="72"
            height="132"
            rx="12"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3.5"
          />
          {/* Screen area */}
          <rect
            x="10"
            y="16"
            width="60"
            height="108"
            rx="4"
            fill="rgba(242, 242, 242, 0.08)"
            stroke="rgba(242, 242, 242, 0.2)"
            strokeWidth="1"
          />
          {/* Camera speaker notch */}
          <line x1="32" y1="10" x2="48" y2="10" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          {/* Home indicator bar */}
          <line x1="28" y1="130" x2="52" y2="130" stroke="rgba(242, 242, 242, 0.6)" strokeWidth="2.5" strokeLinecap="round" />
          {/* Central Prism Icon inside phone screen */}
          <polygon
            points="40,46 54,76 26,76"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Typography & Messaging */}
      <div style={{ maxWidth: '380px' }}>
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '18px',
            fontWeight: 800,
            letterSpacing: '3px',
            color: '#FFFFFF',
            margin: '0 0 12px 0',
            textTransform: 'uppercase',
          }}
        >
          ROTATE YOUR DEVICE
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-subheading)',
            fontSize: '11px',
            letterSpacing: '1.5px',
            color: 'rgba(242, 242, 242, 0.75)',
            textTransform: 'uppercase',
            margin: '0 0 18px 0',
            lineHeight: 1.6,
          }}
        >
          PLEASE TILT TO LANDSCAPE / HORIZONTAL ORIENTATION
        </p>
        <div
          style={{
            padding: '10px 18px',
            background: 'rgba(242, 242, 242, 0.05)',
            border: '1px solid rgba(242, 242, 242, 0.14)',
            borderRadius: '9999px',
            display: 'inline-block',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-content)',
              fontSize: '11px',
              color: 'rgba(242, 242, 242, 0.5)',
              letterSpacing: '0.5px',
            }}
          >
            3D Spatial Stacks & Bento Workspaces require horizontal view
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrientationGuard;
