'use client';

import React from 'react';

interface SparklineProps {
  data: number[];
  color?: string; // e.g. "stroke-primary-500"
  height?: number;
  width?: number;
  strokeWidth?: number;
  fill?: boolean;
}

/**
 * A beautiful, pure SVG sparkline component.
 * Uses a smooth bezier curve algorithm to connect data points.
 */
export default function Sparkline({
  data,
  color = 'stroke-primary-500',
  height = 60,
  width = 200,
  strokeWidth = 2.5,
  fill = true,
}: SparklineProps) {
  if (!data || data.length === 0) return null;
  if (data.length === 1) data = [data[0], data[0]]; // Need at least 2 points

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // avoid division by zero

  const paddingY = strokeWidth * 2;
  const effectiveHeight = height - paddingY * 2;
  
  // Calculate coordinates
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - paddingY - ((val - min) / range) * effectiveHeight;
    return { x, y };
  });

  // Create smooth bezier path
  const buildSmoothPath = () => {
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const xMid = (points[i].x + points[i + 1].x) / 2;
      path += ` C ${xMid},${points[i].y} ${xMid},${points[i + 1].y} ${points[i + 1].x},${points[i + 1].y}`;
    }
    return path;
  };

  const linePath = buildSmoothPath();
  const fillPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
      <defs>
        <linearGradient id="sparkline-gradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" className={color.replace('stroke-', 'text-')} />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" className={color.replace('stroke-', 'text-')} />
        </linearGradient>
      </defs>
      
      {fill && (
        <path
          d={fillPath}
          fill="url(#sparkline-gradient)"
          className="transition-all duration-700 ease-in-out"
        />
      )}
      <path
        d={linePath}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-all duration-700 ease-in-out ${color}`}
      />
      {/* Current/Last Point indicator */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={strokeWidth * 1.5}
        className={`fill-background ${color} stroke-[2px] transition-all duration-700`}
      />
    </svg>
  );
}
