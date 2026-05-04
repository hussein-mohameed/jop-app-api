import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HR Dashboard',
};

/**
 * HR dashboard — view for HR Staff and HR Manager.
 */
export default function HRDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">HR Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Manage employees, payroll, recruitment, and company-wide HR operations.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Employees', value: '—' },
          { label: 'Pending Requests', value: '—' },
          { label: 'Payroll Status', value: '—' },
          { label: 'Open Jobs', value: '—' },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
