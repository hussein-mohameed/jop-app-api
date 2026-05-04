/**
 * @file Department chart — visual bar chart of employee distribution.
 * Pure CSS bars — no chart library needed.
 * UI component only — receives data via props.
 */

'use client';

import type { DepartmentDistribution } from '@/hooks/dashboard/useDashboard';

interface DepartmentChartProps {
  departments: DepartmentDistribution[];
}

/** Color palette for department bars */
const BAR_COLORS = [
  'bg-primary-500',
  'bg-secondary-500',
  'bg-info-500',
  'bg-warning-500',
  'bg-success-500',
  'bg-danger-500',
  'bg-primary-400',
  'bg-secondary-400',
];

export default function DepartmentChart({ departments }: DepartmentChartProps) {
  const maxCount = Math.max(...departments.map((d) => d.employeeCount), 1);

  if (departments.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No department data available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {departments.map((dept, index) => {
        const percentage = (dept.employeeCount / maxCount) * 100;
        const barColor = BAR_COLORS[index % BAR_COLORS.length];

        return (
          <div key={dept.departmentCode} className="group">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground group-hover:text-primary-600 transition-colors">
                {dept.departmentName}
              </span>
              <span className="font-mono text-muted-foreground">
                {dept.employeeCount}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
