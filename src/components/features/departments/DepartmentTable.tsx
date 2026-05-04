/**
 * @file Department table — displays all departments in a data table.
 * UI component only — receives data and handlers via props.
 */

'use client';

import { cn, getInitials, formatDate } from '@/lib/utils';
import type { DepartmentRow } from '@/hooks/departments/useDepartments';

interface DepartmentTableProps {
  departments: DepartmentRow[];
  isLoading: boolean;
  onEdit: (dept: DepartmentRow) => void;
  onToggleStatus: (dept: DepartmentRow) => void;
}

/** Status badge styles */
const STATUS_STYLES = {
  active: 'bg-success-50 text-success-700 ring-success-600/20',
  inactive: 'bg-danger-50 text-danger-700 ring-danger-600/20',
} as const;

/** Loading skeleton */
function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm animate-pulse">
      <div className="border-b border-border bg-muted/50 px-6 py-3">
        <div className="grid grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 rounded bg-neutral-200" />
          ))}
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border-b border-border px-6 py-4 last:border-0">
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, j) => (
              <div key={j} className="h-4 rounded bg-neutral-100" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DepartmentTable({
  departments,
  isLoading,
  onEdit,
  onToggleStatus,
}: DepartmentTableProps) {
  if (isLoading) return <TableSkeleton />;

  if (departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <svg className="h-7 w-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
          </svg>
        </div>
        <h3 className="mt-4 text-sm font-semibold text-foreground">No departments found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your search or create a new department.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" id="departments-table">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-6 py-3 font-semibold text-muted-foreground">Department</th>
              <th className="px-6 py-3 font-semibold text-muted-foreground">Code</th>
              <th className="px-6 py-3 font-semibold text-muted-foreground">Manager</th>
              <th className="px-6 py-3 font-semibold text-muted-foreground text-center">Employees</th>
              <th className="px-6 py-3 font-semibold text-muted-foreground">Status</th>
              <th className="px-6 py-3 font-semibold text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {departments.map((dept) => (
              <tr
                key={dept.id}
                className="transition-colors hover:bg-muted/30"
              >
                {/* Name + Description */}
                <td className="px-6 py-4">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{dept.name}</p>
                    {dept.description && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground max-w-[250px]">
                        {dept.description}
                      </p>
                    )}
                    {dept.parent && (
                      <p className="mt-0.5 text-xs text-primary-600">
                        ↳ {dept.parent.name}
                      </p>
                    )}
                  </div>
                </td>

                {/* Code */}
                <td className="px-6 py-4">
                  <span className="inline-flex rounded-md bg-muted px-2 py-1 text-xs font-mono font-medium text-foreground">
                    {dept.code}
                  </span>
                </td>

                {/* Manager */}
                <td className="px-6 py-4">
                  {dept.manager ? (
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[10px] font-semibold text-primary-700">
                        {getInitials(`${dept.manager.firstName} ${dept.manager.lastName}`)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm text-foreground">
                          {dept.manager.firstName} {dept.manager.lastName}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>

                {/* Employee Count */}
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center rounded-full bg-info-50 px-2.5 py-0.5 text-xs font-semibold text-info-700">
                    {dept._count.employees}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                      dept.isActive ? STATUS_STYLES.active : STATUS_STYLES.inactive
                    )}
                  >
                    {dept.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    {/* Edit */}
                    <button
                      onClick={() => onEdit(dept)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary-50 hover:text-primary-600"
                      title="Edit department"
                      aria-label={`Edit ${dept.name}`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>

                    {/* Toggle Status */}
                    <button
                      onClick={() => onToggleStatus(dept)}
                      className={cn(
                        'rounded-lg p-2 transition-colors',
                        dept.isActive
                          ? 'text-muted-foreground hover:bg-danger-50 hover:text-danger-600'
                          : 'text-muted-foreground hover:bg-success-50 hover:text-success-600'
                      )}
                      title={dept.isActive ? 'Deactivate' : 'Activate'}
                      aria-label={`${dept.isActive ? 'Deactivate' : 'Activate'} ${dept.name}`}
                    >
                      {dept.isActive ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
