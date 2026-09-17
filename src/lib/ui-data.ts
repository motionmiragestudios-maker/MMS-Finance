import type { Expense, Invoice, Payment, Project } from "@/types/finance";

export const projects: Project[] = [];
export const invoices: Invoice[] = [];
export const payments: Payment[] = [];
export const expenses: Expense[] = [];

export const incomeSummary = {
  totalInvoiced: 0,
  totalReceived: 0,
  totalOutstanding: 0,
  totalExpenses: 0,
  netCashResult: 0,
};

export const formatCurrency = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
