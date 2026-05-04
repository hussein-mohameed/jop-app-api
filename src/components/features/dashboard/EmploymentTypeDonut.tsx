/**
 * @file Employment type donut — visual breakdown of employment types.
 * Pure CSS donut chart — no chart library needed.
 * UI component only — receives data via props.
 */

'use client';

import type { EmploymentTypeBreakdown } from '@/hooks/dashboard/useDashboard';

interface EmploymentTypeDonutProps {
  data: EmploymentTypeBreakdown[];
}

/** Readable labels for employment types */
const TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full-Time',
  PART_TIME: 'Part-Time',
  CONTRACT: 'Contract',
  INTERN: 'Intern',
};

const DONUT_COLORS = [
  { bg: 'bg-primary-500', text: 'text-primary-500' },
  { bg: 'bg-secondary-500', text: 'text-secondary-500' },
  { bg: 'bg-info-500', text: 'text-info-500' },
  { bg: 'bg-warning-500', text: 'text-warning-500' },
];

export default function EmploymentTypeDonut({ data }: EmploymentTypeDonutProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No employee data available
      </div>
    );
  }

  // Build conic gradient segments
  let accumulated = 0;
  const gradientParts = data.map((d, i) => {
    const start = accumulated;
    const percentage = (d.count / total) * 100;
    accumulated += percentage;
    const color = DONUT_COLORS[i % DONUT_COLORS.length];
    return `var(--donut-${i}) ${start}% ${accumulated}%`;
  });

  // CSS variables for colors
  const colorVars: Record<string, string> = {};
  data.forEach((_, i) => {
    const colorMap: Record<number, string> = {
      0: '#6366f1', // primary
      1: '#14b8a6', // secondary
      2: '#3b82f6', // info
      3: '#f59e0b', // warning
    };
    colorVars[`--donut-${i}`] = colorMap[i % 4];
  });

  return (
    <div className="flex items-center gap-6">
      {/* Donut */}
      <div className="relative shrink-0">
        <div
          className="h-28 w-28 rounded-full"
          style={{
            background: `conic-gradient(${gradientParts.join(', ')})`,
            ...colorVars,
          }}
        />
        {/* Inner hole */}
        <div className="absolute inset-3 flex items-center justify-center rounded-full bg-card">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{total}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2.5">
        {data.map((d, i) => {
          const color = DONUT_COLORS[i % DONUT_COLORS.length];
          const percentage = total > 0 ? Math.round((d.count / total) * 100) : 0;

          return (
            <div key={d.type} className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${color.bg}`} />
              <span className="text-sm text-foreground">
                {TYPE_LABELS[d.type] ?? d.type}
              </span>
              <span className="text-xs text-muted-foreground">
                {d.count} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
