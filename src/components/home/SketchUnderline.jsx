import React from 'react';

export default function SketchUnderline({ color = '#e3ae00', width = '160', height = '18', strokeWidth = 6, tilt = 0, className = '' }) {
  // Path scales with width
  const path = `M${width*0.05} ${height*0.8}C${width*0.25} ${height*0.55},${width*0.75} ${height*0.55},${width*0.95} ${height*0.8}`;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', margin: '0 auto', marginTop: '-0.2em', transform: `rotate(${tilt}deg)` }}
    >
      <path
        d={path}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  );
}
