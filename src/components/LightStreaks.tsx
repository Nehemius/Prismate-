import React, { useEffect, useRef } from 'react';
import { animate } from 'animejs';

/**
 * LightStreaks — Anime-opening-style sharp light streak burst effect.
 * Triggered when the prism locks into its logo slot.
 * Hardware-Accelerated: SVG polygons animated exclusively via transform and opacity.
 */

interface LightStreaksProps {
  /** Set to true to fire the burst animation */
  trigger: boolean;
}

const NUM_STREAKS = 16;

export const LightStreaks: React.FC<LightStreaksProps> = ({ trigger }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (!trigger || hasPlayed.current || !containerRef.current) return;
    hasPlayed.current = true;

    const streaks = containerRef.current.querySelectorAll<SVGPolygonElement>('.anime-streak');

    streaks.forEach((streak, i) => {
      const angle = (i / NUM_STREAKS) * Math.PI * 2;
      // Radial distance to shoot out
      const dist = 160 + (i % 3) * 60;
      const targetX = Math.cos(angle) * dist;
      const targetY = Math.sin(angle) * dist;

      animate(streak, {
        opacity: [
          { to: 1, duration: 100, ease: 'outQuad' },
          { to: 0, duration: 450, ease: 'inQuad' },
        ],
        scaleX: [0.2, 4.0],
        scaleY: [0.4, 0.8],
        translateX: [0, targetX],
        translateY: [0, targetY],
        delay: (i % 4) * 25,
        duration: 550,
        ease: 'outExpo',
      });
    });
  }, [trigger]);

  // Sharp anime ray polygon shapes
  const streakElements = Array.from({ length: NUM_STREAKS }, (_, i) => {
    const angle = (i / NUM_STREAKS) * 360;
    return (
      <svg
        key={i}
        className="anime-streak"
        viewBox="-40 -4 80 8"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '80px',
          height: '8px',
          marginLeft: '-40px',
          marginTop: '-4px',
          transform: `rotate(${angle}deg)`,
          transformOrigin: 'center center',
          opacity: 0,
          willChange: 'transform, opacity',
          pointerEvents: 'none',
        }}
      >
        {/* Sharp double-tapered anime streak polygon */}
        <polygon points="-40,0 -10,-3 40,0 -10,3" fill="#FFFFFF" />
      </svg>
    );
  });

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 0,
        height: 0,
        pointerEvents: 'none',
        zIndex: 15,
      }}
      aria-hidden="true"
    >
      {streakElements}
    </div>
  );
};

export default LightStreaks;
