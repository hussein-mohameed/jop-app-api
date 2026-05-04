/**
 * @file Pagination controls component.
 * Reusable pagination bar with page info and navigation.
 */

'use client';

import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

/**
 * Pagination component with previous/next and page numbers.
 */
export default function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  /** Generate page numbers to display */
  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const btnClass =
    'inline-flex items-center justify-center rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row" id="pagination">
      {/* Info */}
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{startItem}</span>
        {' '}to{' '}
        <span className="font-medium text-foreground">{endItem}</span>
        {' '}of{' '}
        <span className="font-medium text-foreground">{total}</span> employees
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={cn(btnClass, 'hover:bg-muted')}
          aria-label="Previous page"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="px-2 text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                btnClass,
                p === page
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'hover:bg-muted text-muted-foreground'
              )}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={cn(btnClass, 'hover:bg-muted')}
          aria-label="Next page"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
