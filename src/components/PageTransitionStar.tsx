import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ScreenType } from '../types/prismate';

interface PageTransitionStarProps {
  active: boolean;
  targetScreen?: ScreenType | null;
}

/**
 * PageTransitionStar — Toned-Down Star Whirl Transition for Page Switching
 *
 * SPECIFICATION:
 *   - Dark obsidian background (rgba(0,0,0,0.78) with backdrop-filter: blur(12px)) — NOT blinding white strobe.
 *   - Sleek, comfortable, non-scary vector star/pinwheel morphing smoothly at dead-center.
 *   - Subtle electric cyan & white optical glow (drop-shadow).
 *   - Displays target screen title in Prismate typography.
 */
export const PageTransitionStar: React.FC<PageTransitionStarProps> = ({
  active,
  targetScreen,
}) => {
  const [rotation, setRotation] = useState(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    const startTime = performance.now();
    const loop = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      setRotation(elapsed * 240); // Smooth spin ~240deg/sec
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [active]);

  const screenNames: Record<ScreenType, string> = {
    home: 'YOU / HOME',
    chemistry: 'CHEMISTRY',
    physics: 'PHYSICS',
    mathematics: 'MATHEMATICS',
    stacks: '3D STACKS',
    profile: 'SETTINGS',
  };

  const displayName = targetScreen ? screenNames[targetScreen] || targetScreen.toUpperCase() : 'WORKSPACE';

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="page-transition-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99998,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {/* ── Center Toned-Down Star / Pinwheel Icon ── */}
          <div
            style={{
              position: 'relative',
              width: '90px',
              height: '90px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Soft Cyan Optical Glow Halo */}
            <div
              style={{
                position: 'absolute',
                inset: '-16px',
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(51, 240, 255, 0.22) 0%, rgba(0, 85, 255, 0.08) 50%, transparent 75%)',
                pointerEvents: 'none',
              }}
            />

            {/* 5-Blade Geometric Pinwheel Star Vector */}
            <svg
              viewBox="-100 -100 200 200"
              style={{
                width: '84px',
                height: '84px',
                transform: `rotate(${rotation}deg)`,
                filter:
                  'drop-shadow(0 0 10px rgba(51, 240, 255, 0.8)) drop-shadow(0 0 20px rgba(0, 85, 255, 0.5))',
              }}
            >
              {/* Outer Ring Accent */}
              <circle
                cx="0"
                cy="0"
                r="82"
                fill="none"
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="1"
                strokeDasharray="3 4"
              />

              {/* Inner Geometric Star / Pinwheel Blades */}
              <polygon
                points="0,-68 18,-24 64,-20 28,14 40,60 0,32 -40,60 -28,14 -64,-20 -18,-24"
                fill="#FFFFFF"
                stroke="#E6FFFF"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              {/* Central Core Polygon */}
              <polygon
                points="0,-22 19,-7 12,18 -12,18 -19,-7"
                fill="#000000"
                stroke="#33F0FF"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          {/* ── Subtitle / Target Screen Name ── */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '4px',
                color: '#FFFFFF',
                textTransform: 'uppercase',
                display: 'block',
              }}
            >
              {displayName}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-subheading)',
                fontSize: '9px',
                letterSpacing: '2px',
                color: 'rgba(242, 242, 242, 0.55)',
                textTransform: 'uppercase',
                marginTop: '4px',
                display: 'block',
              }}
            >
              TRANSITIONING WORKSPACE
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageTransitionStar;
