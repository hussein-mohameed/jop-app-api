/**
 * @file Generic DataFilters component.
 * Provides a debounced search input and dynamic dropdown filters.
 */

'use client';

import React, { useState, useEffect } from 'react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDef {
  key: string;
  label: string;
  options: FilterOption[];
}

export interface DataFiltersProps {
  /** Current search query value */
  searchQuery?: string;
  /** Callback when search query changes (debounced automatically internally) */
  onSearchChange?: (value: string) => void;
  /** Search placeholder text */
  searchPlaceholder?: string;
  
  /** Current active filters (key-value pair) */
  activeFilters?: Record<string, string>;
  /** Configuration for dropdown filters */
  filters?: FilterDef[];
  /** Callback when a dropdown filter changes */
  onFilterChange?: (key: string, value: string) => void;
  /** Callback to clear all filters and search */
  onClearFilters?: () => void;

  /** Action button configuration (e.g., 'Add Record') */
  actionButton?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
}

/**
 * A highly reusable generic filter bar with debounced search and dropdowns.
 */
export default function DataFilters({
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  activeFilters = {},
  filters = [],
  onFilterChange,
  onClearFilters,
  actionButton,
}: DataFiltersProps) {
  // Local state for immediate input feedback before debouncing
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Sync local state if parent prop changes externally
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery && onSearchChange) {
        onSearchChange(localSearch);
      }
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, onSearchChange]);

  const hasActiveFilters = 
    localSearch !== '' || 
    Object.values(activeFilters).some((val) => val !== '' && val !== undefined && val !== null);

  const selectClass =
    'rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 min-w-[140px]';

  return (
    <div className="space-y-4">
      {/* Top row: search + action button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        {onSearchChange && (
          <div className="relative flex-1 max-w-md">
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
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
            />
          </div>
        )}

        {/* Action button */}
        {actionButton && (
          <button
            onClick={actionButton.onClick}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            {actionButton.icon || (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            )}
            {actionButton.label}
          </button>
        )}
      </div>

      {/* Filter dropdowns */}
      {(filters.length > 0 || hasActiveFilters) && (
        <div className="flex flex-wrap gap-3">
          {filters.map((filter) => (
            <select
              key={filter.key}
              value={activeFilters[filter.key] || ''}
              onChange={(e) => onFilterChange && onFilterChange(filter.key, e.target.value)}
              className={selectClass}
            >
              <option value="">{filter.label}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}

          {/* Clear filters */}
          {hasActiveFilters && onClearFilters && (
            <button
              onClick={() => {
                setLocalSearch(''); // Clear local search state too
                onClearFilters();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
