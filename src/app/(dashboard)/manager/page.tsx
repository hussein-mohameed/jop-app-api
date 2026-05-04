import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manager Dashboard',
};

/**
 * Manager dashboard — view for department managers.
 */
export default function ManagerDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Manager Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Manage your team, approve leave requests, and track department performance.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Team Members', value: '—' },
          { label: 'Pending Approvals', value: '—' },
          { label: 'Open Positions', value: '—' },
          { label: 'Dept. Budget', value: '—' },
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
