/**
 * @file Department filters — search bar + status filter + create button.
 * UI component only — receives handlers via props.
 */

'use client';

import { useState, useEffect } from 'react';

interface DepartmentFiltersProps {
  filters: {
    search: string;
    isActive: string;
  };
  onFilterChange: (filters: { search?: string; isActive?: string }) => void;
  onCreateClick: () => void;
}

export default function DepartmentFilters({
  filters,
  onFilterChange,
  onCreateClick,
}: DepartmentFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ search: searchInput });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, filters.search, onFilterChange]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: Search + Filter */}
      <div className="flex flex-1 gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="search"
            placeholder="Search departments..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 placeholder-muted-foreground"
            id="dept-search"
          />
        </div>

        {/* Status filter */}
        <select
          value={filters.isActive}
          onChange={(e) => onFilterChange({ isActive: e.target.value })}
          className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
          id="dept-status-filter"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Right: Create button */}
      <button
        onClick={onCreateClick}
        className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-500 hover:shadow-md"
        id="create-dept-btn"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Department
      </button>
    </div>
  );
}
