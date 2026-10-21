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
export const AnalogClock: React.FC<AnalogClockProps> = ({ time, size = 120 }) => {
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  const secondDeg = seconds * 6; // 360 / 60
  const minuteDeg = minutes * 6 + seconds * 0.1; // 360 / 60
  const hourDeg = hours * 30 + minutes * 0.5; // 360 / 12

  const radius = 46;
  const center = 50;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ overflow: 'visible', userSelect: 'none' }}
    >
      {/* Outer Dial Circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="rgba(10, 10, 10, 0.65)"
        stroke="rgba(242, 242, 242, 0.25)"
        strokeWidth="1.5"
      />

      {/* 12 Hour Tick Marks */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const isQuarter = i % 3 === 0;
        const tickLength = isQuarter ? 6 : 3;
        const x1 = center + (radius - 2) * Math.sin(angle);
        const y1 = center - (radius - 2) * Math.cos(angle);
        const x2 = center + (radius - 2 - tickLength) * Math.sin(angle);
        const y2 = center - (radius - 2 - tickLength) * Math.cos(angle);

        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={isQuarter ? '#F2F2F2' : 'rgba(242, 242, 242, 0.35)'}
            strokeWidth={isQuarter ? 1.5 : 0.8}
            strokeLinecap="round"
          />
        );
      })}

      {/* Hour Hand */}
      <line
        x1={center}
        y1={center}
        x2={center}
        y2={center - 24}
        stroke="#F2F2F2"
        strokeWidth="2.4"
        strokeLinecap="round"
        transform={`rotate(${hourDeg} ${center} ${center})`}
      />

      {/* Minute Hand */}
      <line
        x1={center}
        y1={center}
        x2={center}
        y2={center - 34}
        stroke="#F2F2F2"
        strokeWidth="1.6"
        strokeLinecap="round"
        transform={`rotate(${minuteDeg} ${center} ${center})`}
      />

      {/* Second Hand */}
      <line
        x1={center}
        y1={center + 6}
        x2={center}
        y2={center - 38}
        stroke="#EB104B"
        strokeWidth="1"
        strokeLinecap="round"
        transform={`rotate(${secondDeg} ${center} ${center})`}
      />

      {/* Center Pivot Pin */}
      <circle cx={center} cy={center} r="2.5" fill="#EB104B" />
      <circle cx={center} cy={center} r="1" fill="#FFFFFF" />
    </svg>
  );
};

export default AnalogClock;
