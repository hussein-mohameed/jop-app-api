/**
 * @file Generic DataTable component.
 * Highly reusable table component that accepts generic data types and column definitions.
 * Follows Open/Closed Principle: Open for extension via custom cell renderers, closed for modification.
 */

import React from 'react';

/** Defines a single column in the DataTable */
export interface ColumnDef<T> {
  /** Unique key for the column, often maps to a key in the data object */
  key: string;
  /** Header label displayed in the table header */
  header: string;
  /** Optional custom renderer for the cell content. If not provided, it will try to render data[key] */
  renderCell?: (item: T) => React.ReactNode;
  /** Optional column width class (e.g., 'w-1/4' or 'min-w-[200px]') */
  className?: string;
  /** If true, aligns the header and content to the right */
  alignRight?: boolean;
}

/** Defines a row-level action (e.g., Edit, Delete) */
export interface RowAction<T> {
  /** Label for the action (used for tooltips/aria-labels) */
  label: string;
  /** The icon to display */
  icon: React.ReactNode;
  /** Handler function when the action is clicked */
  onClick: (item: T) => void;
  /** Optional variant to style the action button differently */
  variant?: 'default' | 'danger' | 'warning' | 'primary';
}

export interface DataTableProps<T> {
  /** The data array to render */
  data: T[];
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Unique identifier key for each row item (e.g., 'id') */
  keyExtractor: (item: T) => string | number;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Row-level actions */
  actions?: RowAction<T>[];
  /** Custom empty state message or component */
  emptyState?: React.ReactNode;
}

/**
 * A strongly-typed generic data table component.
 * Usage: <DataTable<Employee> data={employees} columns={columns} keyExtractor={(e) => e.id} />
 */
export default function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  actions,
  emptyState,
}: DataTableProps<T>) {
  if (isLoading) {
    return <TableSkeleton columnsCount={columns.length + (actions?.length ? 1 : 0)} />;
  }

  if (!data || data.length === 0) {
    return <>{emptyState || <DefaultEmptyState />}</>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`whitespace-nowrap px-4 py-3.5 font-semibold text-muted-foreground ${col.alignRight ? 'text-right' : ''
                    } ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-muted-foreground text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className="transition-colors hover:bg-muted/30"
              >
                {columns.map((col) => (
                  <td
                    key={`${keyExtractor(item)}-${col.key}`}
                    className={`whitespace-nowrap px-4 py-3 ${col.alignRight ? 'text-right' : ''
                      } ${col.className || ''}`}
                  >
                    {col.renderCell
                      ? col.renderCell(item)
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      : (item as any)[col.key] as React.ReactNode}
                  </td>
                ))}

                {actions && actions.length > 0 && (
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {actions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => action.onClick(item)}
                          className={`rounded-lg p-2 transition-colors ${getActionStyles(
                            action.variant
                          )}`}
                          title={action.label}
                          aria-label={action.label}
                        >
                          {action.icon}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Helper Components & Functions ---

function getActionStyles(variant?: 'default' | 'danger' | 'warning' | 'primary') {
  switch (variant) {
    case 'danger':
      return 'text-muted-foreground hover:bg-danger-50 hover:text-danger-600';
    case 'warning':
      return 'text-muted-foreground hover:bg-warning-50 hover:text-warning-600';
    case 'primary':
      return 'text-muted-foreground hover:bg-primary-50 hover:text-primary-600';
    default:
      return 'text-muted-foreground hover:bg-muted hover:text-foreground';
  }
}

function TableSkeleton({ columnsCount }: { columnsCount: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="animate-pulse">
        <div className="border-b border-border bg-muted/50 px-4 py-4">
          <div className="h-4 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border px-4 py-4">
            {Array.from({ length: columnsCount }).map((_, j) => (
              <div key={j} className="h-4 flex-1 rounded bg-neutral-200 dark:bg-neutral-800" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function DefaultEmptyState() {
  return (
    <div className="rounded-xl border border-border bg-card py-16 text-center shadow-sm">
      <svg
        className="mx-auto h-12 w-12 text-muted-foreground/50"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
        />
      </svg>
      <h3 className="mt-4 text-lg font-semibold text-foreground">No data found</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        There are currently no records to display.
      </p>
    </div>
  );
}
