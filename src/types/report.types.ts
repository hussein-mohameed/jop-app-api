/**
 * @file Comprehensive Report type definitions.
 */

export interface HealthScore {
  score: number;
  status: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  trend: number;
}

export interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  trend: number;
  trendLabel: string;
  icon: 'users' | 'money' | 'briefcase' | 'calendar' | 'gift' | 'shield';
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
}

export interface SparklineData {
  label: string;
  value: number;
}

export interface DonutData {
  label: string;
  value: number;
  color: string; // Tailwind color class or hex
}

export interface ActivityFeedItem {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  type: 'hire' | 'leave' | 'payroll' | 'bonus' | 'job';
}

export interface DepartmentBudget {
  department: string;
  allocated: number;
  spent: number;
}

export interface ComprehensiveReport {
  healthScore: HealthScore;
  primaryMetrics: MetricCard[];
  
  // Workforce
  headcountTrend: SparklineData[];
  departmentDistribution: DonutData[];
  
  // Financials
  payrollTrend: { label: string; gross: number; net: number }[];
  departmentBudgets: DepartmentBudget[];
  
  // Operations
  leaveUtilization: number; // Percentage 0-100
  openJobsCount: number;
  pendingActions: number;
  
  // Feed
  recentActivities: ActivityFeedItem[];
}
