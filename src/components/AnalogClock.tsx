import React from 'react';

interface AnalogClockProps {
  time: Date;
  size?: number;
}

/**
 * AnalogClock
 *
 * Minimalist geometric analog clock face rendered in SVG.
 * Clean monochrome palette matching the PRISMATE aesthetic.
 */
const RADIUS = 46;
const CENTER = 50;

const CLOCK_TICKS = Array.from({ length: 12 }).map((_, i) => {
  const angle = (i * 30 * Math.PI) / 180;
  const isQuarter = i % 3 === 0;
  const tickLength = isQuarter ? 6 : 3;
  return {
    key: i,
    x1: CENTER + (RADIUS - 2) * Math.sin(angle),
    y1: CENTER - (RADIUS - 2) * Math.cos(angle),
    x2: CENTER + (RADIUS - 2 - tickLength) * Math.sin(angle),
    y2: CENTER - (RADIUS - 2 - tickLength) * Math.cos(angle),
    stroke: isQuarter ? '#F2F2F2' : 'rgba(242, 242, 242, 0.35)',
    strokeWidth: isQuarter ? 1.5 : 0.8,
  };
});

export const AnalogClock: React.FC<AnalogClockProps> = ({ time, size = 120 }) => {
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  const secondDeg = seconds * 6; // 360 / 60
  const minuteDeg = minutes * 6 + seconds * 0.1; // 360 / 60
  const hourDeg = hours * 30 + minutes * 0.5; // 360 / 12

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ overflow: 'visible', userSelect: 'none' }}
    >
      {/* Outer Dial Circle */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        fill="rgba(10, 10, 10, 0.65)"
        stroke="rgba(242, 242, 242, 0.25)"
        strokeWidth="1.5"
      />

      {/* 12 Hour Tick Marks */}
      {CLOCK_TICKS.map((tick) => (
        <line
          key={tick.key}
          x1={tick.x1}
          y1={tick.y1}
          x2={tick.x2}
          y2={tick.y2}
          stroke={tick.stroke}
          strokeWidth={tick.strokeWidth}
          strokeLinecap="round"
        />
      ))}

      {/* Hour Hand */}
      <line
        x1={CENTER}
        y1={CENTER}
        x2={CENTER}
        y2={CENTER - 24}
        stroke="#F2F2F2"
        strokeWidth="2.4"
        strokeLinecap="round"
        transform={`rotate(${hourDeg} ${CENTER} ${CENTER})`}
      />

      {/* Minute Hand */}
      <line
        x1={CENTER}
        y1={CENTER}
        x2={CENTER}
        y2={CENTER - 34}
        stroke="#F2F2F2"
        strokeWidth="1.6"
        strokeLinecap="round"
        transform={`rotate(${minuteDeg} ${CENTER} ${CENTER})`}
      />

      {/* Second Hand */}
      <line
        x1={CENTER}
        y1={CENTER + 6}
        x2={CENTER}
        y2={CENTER - 38}
        stroke="#EB104B"
        strokeWidth="1"
        strokeLinecap="round"
        transform={`rotate(${secondDeg} ${CENTER} ${CENTER})`}
      />

      {/* Center Pivot Pin */}
      <circle cx={CENTER} cy={CENTER} r="2.5" fill="#EB104B" />
      <circle cx={CENTER} cy={CENTER} r="1" fill="#FFFFFF" />
    </svg>
  );
};

export default AnalogClock;
