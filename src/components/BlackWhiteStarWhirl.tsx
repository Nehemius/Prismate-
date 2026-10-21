import React from 'react';

export type StarWhirlFrame = 0 | 1 | 2 | 3 | 4;

interface BlackWhiteStarWhirlProps {
  frame: StarWhirlFrame;
}

/**
 * MODULE 2: Standalone Black & White Star / Pinwheel Whirl Animation
 * Stark pure #FFFFFF canvas + 4 stark #000000 geometric vector frames.
 * Kept completely decoupled as requested.
 */
export const BlackWhiteStarWhirl: React.FC<BlackWhiteStarWhirlProps> = ({ frame }) => {
  if (frame === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      {/* Frame 1 (0ms – 90ms): Small Center Black Star Ignition + Bottom-Right Spark */}
      {frame === 1 && (
        <svg viewBox="0 0 1000 1000" style={{ width: '100%', height: '100%' }}>
          <polygon
            points="500,465 509,490 536,490 514,506 522,532 500,516 478,532 486,506 464,490 491,490"
            fill="#000000"
          />
          <polygon
            points="745,735 762,785 815,785 772,816 788,866 745,835 702,866 718,816 675,785 728,785"
            fill="#000000"
          />
        </svg>
      )}

      {/* Frame 2 (90ms – 180ms): Giant Bold Solid 5-Point Black Star */}
      {frame === 2 && (
        <svg viewBox="0 0 1000 1000" style={{ width: '100%', height: '100%' }}>
          <polygon
            points="485,155 588,370 825,395 648,555 698,790 485,672 272,790 322,555 145,395 382,370"
            fill="#000000"
          />
        </svg>
      )}

      {/* Frame 3 (180ms – 270ms): Twisted 5-Blade Pinwheel Star with Central Black Pentagon */}
      {frame === 3 && (
        <svg viewBox="0 0 1000 1000" style={{ width: '100%', height: '100%' }}>
          {/* Central Solid Black Pentagon */}
          <polygon points="500,365 628,458 579,608 421,608 372,458" fill="#000000" />
          {/* 5 Sharp Pinwheel Triangular Blades Whirling Around Pentagon Vertices */}
          <polygon points="500,365 628,458 455,145" fill="#000000" />
          <polygon points="628,458 579,608 875,385" fill="#000000" />
          <polygon points="579,608 421,608 755,865" fill="#000000" />
          <polygon points="421,608 372,458 195,825" fill="#000000" />
          <polygon points="372,458 500,365 125,415" fill="#000000" />
        </svg>
      )}

      {/* Frame 4 (270ms – 370ms): Counter-Whirled Pinwheel Blades + Inner Negative-Space Star */}
      {frame === 4 && (
        <svg viewBox="0 0 1000 1000" style={{ width: '100%', height: '100%' }}>
          <path
            fill="#000000"
            fillRule="evenodd"
            d="M500,355 L638,455 L585,618 L415,618 L362,455 Z
               M500,390 L530,475 L620,475 L548,528 L575,612 L500,560 L425,612 L452,528 L380,475 L470,475 Z"
          />
          <polygon points="500,355 638,455 570,130" fill="#000000" />
          <polygon points="638,455 585,618 895,470" fill="#000000" />
          <polygon points="585,618 415,618 730,895" fill="#000000" />
          <polygon points="415,618 362,455 155,755" fill="#000000" />
          <polygon points="362,455 500,355 150,310" fill="#000000" />
        </svg>
      )}
    </div>
  );
};

export default BlackWhiteStarWhirl;
