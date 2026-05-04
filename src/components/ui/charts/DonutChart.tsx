'use client';

import React from 'react';

interface DonutData {
  label: string;
  value: number;
  color: string; // Tailwind text color class, e.g. text-primary-500
}

interface DonutChartProps {
  data: DonutData[];
  size?: number;
  strokeWidth?: number;
}

/**
 * A beautiful, pure SVG donut chart component.
 */
export default function DonutChart({
  data,
  size = 160,
  strokeWidth = 24,
}: DonutChartProps) {
  if (!data || data.length === 0) return null;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  let currentOffset = 0;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 transform overflow-visible">
        {data.map((item, index) => {
          const dashArray = (item.value / total) * circumference;
          const dashOffset = currentOffset;
          
          // Gap effect
          const adjustedDashArray = dashArray > 4 ? dashArray - 4 : dashArray;
          
          currentOffset -= dashArray;

          return (
            <circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={`${adjustedDashArray} ${circumference}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className={`transition-all duration-1000 ease-out hover:stroke-[${strokeWidth + 4}px] ${item.color.replace('text-', 'stroke-')}`}
            />
          );
        })}
      </svg>
      {/* Center Label (Total) */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold text-foreground">{total}</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total</span>
      </div>
    </div>
  );
}
