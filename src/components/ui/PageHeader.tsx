/**
 * @file Generic PageHeader component.
 * Displays page title, description, and optional statistics cards.
 */

import React from 'react';

export interface StatCard {
  label: string;
  value: string | number;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export interface PageHeaderProps {
  /** Page Title */
  title: string;
  /** Page description */
  description: string;
  /** Array of stats to display at the top */
  stats?: StatCard[];
}

/**
 * A highly reusable page header and stats component.
 */
export default function PageHeader({ title, description, stats }: PageHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Stats Cards */}
      {stats && stats.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
