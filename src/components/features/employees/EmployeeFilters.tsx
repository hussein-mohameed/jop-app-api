/**
 * @file Employee filters bar.
 * Search input + filter dropdowns for the employees list.
 * UI component only — receives handlers from parent.
 */

'use client';

import { useState, useEffect } from 'react';
import type { EmployeeQuery, DepartmentOption } from '@/hooks/employees/useEmployees';

interface EmployeeFiltersProps {
  query: EmployeeQuery;
  departments: DepartmentOption[];
  onFilterChange: (filters: Partial<EmployeeQuery>) => void;
  onCreateClick: () => void;
}

/**
 * Employees filter bar with debounced search, department filter,
 * status filter, employment type filter, and create button.
 */
export default function EmployeeFilters({
  query,
  departments,
  onFilterChange,
  onCreateClick,
}: EmployeeFiltersProps) {
  const [searchValue, setSearchValue] = useState(query.search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== query.search) {
        onFilterChange({ search: searchValue });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchValue, query.search, onFilterChange]);

  const selectClass =
    'rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30';

  return (
    <div className="space-y-4" id="employee-filters">
      {/* Top row: search + create button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="search"
            id="employee-search"
            placeholder="Search by name, email, ID, or position..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
          />
        </div>

        {/* Create button */}
        <button
          onClick={onCreateClick}
          id="create-employee-btn"
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Employee
        </button>
      </div>

      {/* Filter dropdowns */}
      <div className="flex flex-wrap gap-3">
        {/* Department filter */}
        <select
          id="filter-department"
          value={query.departmentId}
          onChange={(e) => onFilterChange({ departmentId: e.target.value })}
          className={selectClass}
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          id="filter-status"
          value={query.employmentStatus}
          onChange={(e) => onFilterChange({ employmentStatus: e.target.value })}
          className={selectClass}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ON_LEAVE">On Leave</option>
          <option value="TERMINATED">Terminated</option>
          <option value="PROBATION">Probation</option>
        </select>

        {/* Employment type filter */}
        <select
          id="filter-type"
          value={query.employmentType}
          onChange={(e) => onFilterChange({ employmentType: e.target.value })}
          className={selectClass}
        >
          <option value="">All Types</option>
          <option value="FULL_TIME">Full Time</option>
          <option value="PART_TIME">Part Time</option>
          <option value="CONTRACT">Contract</option>
          <option value="INTERN">Intern</option>
        </select>

        {/* Sort */}
        <select
          id="filter-sort"
          value={`${query.sortBy}-${query.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-') as [string, 'asc' | 'desc'];
            onFilterChange({ sortBy, sortOrder });
          }}
          className={selectClass}
        >
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="hireDate-desc">Hire Date (Latest)</option>
          <option value="hireDate-asc">Hire Date (Earliest)</option>
          <option value="employeeId-asc">Employee ID ↑</option>
          <option value="employeeId-desc">Employee ID ↓</option>
        </select>

        {/* Clear filters */}
        {(query.search || query.departmentId || query.employmentStatus || query.employmentType) && (
          <button
            onClick={() => {
              setSearchValue('');
              onFilterChange({
                search: '',
                departmentId: '',
                employmentStatus: '',
                employmentType: '',
              });
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            id="clear-filters-btn"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
