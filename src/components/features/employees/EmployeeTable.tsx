/**
 * @file Employee data table component.
 * Renders the employees list as a responsive table with actions.
 * UI component only — receives data and handlers from parent.
 */

'use client';

import { getInitials, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';

/** Employee row data shape (from API) */
interface EmployeeRow {
  id: string;
  employeeId: string;
  position: string;
  employmentType: string;
  employmentStatus: string;
  hireDate: string;
  departmentId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    avatarUrl: string | null;
  };
  department: {
    name: string;
    code: string;
  };
}

interface EmployeeTableProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  employees: any[];
  isLoading: boolean;
  onEdit: (employee: EmployeeRow) => void;
  onChangeStatus: (employee: EmployeeRow) => void;
}

/** Employment type display labels */
const TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full-Time',
  PART_TIME: 'Part-Time',
  CONTRACT: 'Contract',
  INTERN: 'Intern',
};

/**
 * Employees table with avatar, name, department, position, status, and actions.
 */
export default function EmployeeTable({
  employees,
  isLoading,
  onEdit,
  onChangeStatus,
}: EmployeeTableProps) {
  if (isLoading) {
    return <TableSkeleton />;
  }

  if (!employees || employees.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" id="employees-table">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-muted-foreground">
                Employee
              </th>
              <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-muted-foreground">
                Department
              </th>
              <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-muted-foreground">
                Position
              </th>
              <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-muted-foreground">
                Type
              </th>
              <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-muted-foreground">
                Status
              </th>
              <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-muted-foreground">
                Hire Date
              </th>
              <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-muted-foreground text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {employees.map((emp: EmployeeRow) => (
              <tr
                key={emp.id}
                className="transition-colors hover:bg-muted/30"
              >
                {/* Employee info (avatar + name + email + ID) */}
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                      {emp.user.avatarUrl ? (
                        <img
                          src={emp.user.avatarUrl}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        getInitials(`${emp.user.firstName} ${emp.user.lastName}`)
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {emp.user.firstName} {emp.user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {emp.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {emp.employeeId}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Department */}
                <td className="whitespace-nowrap px-4 py-3">
                  <div>
                    <p className="text-foreground">{emp.department.name}</p>
                    <p className="text-xs text-muted-foreground">{emp.department.code}</p>
                  </div>
                </td>

                {/* Position */}
                <td className="whitespace-nowrap px-4 py-3 text-foreground">
                  {emp.position}
                </td>

                {/* Employment Type */}
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {TYPE_LABELS[emp.employmentType] ?? emp.employmentType}
                </td>

                {/* Status */}
                <td className="whitespace-nowrap px-4 py-3">
                  <StatusBadge status={emp.employmentStatus} />
                </td>

                {/* Hire Date */}
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {formatDate(emp.hireDate)}
                </td>

                {/* Actions */}
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(emp)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary-50 hover:text-primary-600"
                      title="Edit employee"
                      aria-label={`Edit ${emp.user.firstName}`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onChangeStatus(emp)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-warning-50 hover:text-warning-600"
                      title="Change status"
                      aria-label={`Change status of ${emp.user.firstName}`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                      </svg>
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

/** Loading skeleton */
function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="animate-pulse">
        <div className="border-b border-border bg-muted/50 px-4 py-4">
          <div className="h-4 w-1/3 rounded bg-neutral-200" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border px-4 py-4">
            <div className="h-10 w-10 rounded-full bg-neutral-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/4 rounded bg-neutral-200" />
              <div className="h-3 w-1/6 rounded bg-neutral-100" />
            </div>
            <div className="h-4 w-20 rounded bg-neutral-200" />
            <div className="h-4 w-16 rounded bg-neutral-200" />
            <div className="h-6 w-16 rounded-full bg-neutral-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Empty state */
function EmptyState() {
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
      <h3 className="mt-4 text-lg font-semibold text-foreground">No employees found</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating your first employee.
      </p>
    </div>
  );
}
