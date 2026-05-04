/**
 * @file Payroll and salary type definitions.
 */

import type { BaseEntity } from './common.types';

/** Salary component type */
export type SalaryComponentType = 'ALLOWANCE' | 'DEDUCTION' | 'BONUS' | 'TAX';

/** Salary record */
export interface Salary extends BaseEntity {
  employeeId: string;
  employeeName: string;
  baseSalary: number;
  effectiveDate: Date;
  endDate?: Date;
  isActive: boolean;
  components: SalaryComponent[];
  totalAllowances: number;
  totalDeductions: number;
  netSalary: number;
}

/** Individual salary component */
export interface SalaryComponent extends BaseEntity {
  salaryId: string;
  name: string;
  type: SalaryComponentType;
  amount: number;
  isPercentage: boolean;
  description?: string;
}

/** Payslip */
export interface Payslip extends BaseEntity {
  employeeId: string;
  employeeName: string;
  month: number;
  year: number;
  baseSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  totalBonuses: number;
  grossPay: number;
  netPay: number;
  isPaid: boolean;
  paidAt?: Date;
  components: PayslipComponent[];
}

/** Payslip line item */
export interface PayslipComponent {
  name: string;
  type: SalaryComponentType;
  amount: number;
}

/** Payroll run summary */
export interface PayrollSummary {
  id: string;
  month: number;
  year: number;
  totalEmployees: number;
  totalGrossPay: number;
  totalNetPay: number;
  totalDeductions: number;
  status: 'DRAFT' | 'PROCESSING' | 'COMPLETED' | 'PAID';
}

/** Create salary data */
export interface CreateSalaryData {
  employeeId: string;
  baseSalary: number;
  effectiveDate: Date;
  components?: Omit<SalaryComponent, keyof BaseEntity | 'salaryId'>[];
}
