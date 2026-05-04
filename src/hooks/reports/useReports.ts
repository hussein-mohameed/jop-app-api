import { useState, useEffect } from 'react';
import type { ComprehensiveReport } from '@/types/report.types';

export function useReports() {
  const [data, setData] = useState<ComprehensiveReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock API fetch
    const timer = setTimeout(() => {
      setData({
        healthScore: {
          score: 92,
          status: 'Excellent',
          trend: 4.5
        },
        primaryMetrics: [
          { id: 'm1', title: 'Total Employees', value: 145, trend: 5.2, trendLabel: 'vs last month', icon: 'users', color: 'primary' },
          { id: 'm2', title: 'Avg. Salary Expense', value: '$98k', trend: -1.4, trendLabel: 'vs last month', icon: 'money', color: 'warning' },
          { id: 'm3', title: 'Open Vacancies', value: 12, trend: 15.0, trendLabel: 'vs last month', icon: 'briefcase', color: 'info' },
          { id: 'm4', title: 'Pending Leaves', value: 8, trend: -2.1, trendLabel: 'vs last month', icon: 'calendar', color: 'secondary' }
        ],
        headcountTrend: [
          { label: 'Jan', value: 120 },
          { label: 'Feb', value: 125 },
          { label: 'Mar', value: 132 },
          { label: 'Apr', value: 140 },
          { label: 'May', value: 142 },
          { label: 'Jun', value: 145 }
        ],
        departmentDistribution: [
          { label: 'Engineering', value: 45, color: 'text-primary-500' },
          { label: 'Sales', value: 30, color: 'text-info-500' },
          { label: 'Marketing', value: 20, color: 'text-secondary-500' },
          { label: 'HR & Ops', value: 15, color: 'text-warning-500' },
          { label: 'Design', value: 10, color: 'text-danger-500' }
        ],
        payrollTrend: [
          { label: 'Jan', gross: 1100000, net: 850000 },
          { label: 'Feb', gross: 1150000, net: 890000 },
          { label: 'Mar', gross: 1220000, net: 955000 },
          { label: 'Apr', gross: 1250000, net: 980000 }
        ],
        departmentBudgets: [
          { department: 'Engineering', allocated: 500000, spent: 480000 },
          { department: 'Sales', allocated: 300000, spent: 310000 }, // Over budget
          { department: 'Marketing', allocated: 200000, spent: 180000 },
          { department: 'HR & Ops', allocated: 150000, spent: 145000 },
          { department: 'Design', allocated: 100000, spent: 85000 }
        ],
        leaveUtilization: 78,
        openJobsCount: 12,
        pendingActions: 14,
        recentActivities: [
          { id: 'a1', title: 'New Hire Onboarded', description: 'Sarah Jenkins joined Engineering', timestamp: new Date(Date.now() - 1000 * 60 * 30), type: 'hire' },
          { id: 'a2', title: 'Payroll Drafted', description: 'April 2026 payroll draft generated', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), type: 'payroll' },
          { id: 'a3', title: 'Leave Approved', description: 'Annual leave approved for John Doe', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), type: 'leave' },
          { id: 'a4', title: 'Job Posted', description: 'Senior Product Designer role published', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), type: 'job' },
          { id: 'a5', title: 'Bonus Approved', description: 'Q1 Performance bonuses approved', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), type: 'bonus' }
        ]
      });
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return { data, isLoading };
}
