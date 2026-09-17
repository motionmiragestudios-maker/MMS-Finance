export type Currency = "INR";

export type InvoiceStatus =
  | "Draft"
  | "Sent"
  | "Partially Paid"
  | "Paid"
  | "Overdue"
  | "Cancelled";

export type ProjectStatus =
  | "Enquiry"
  | "Quotation Sent"
  | "Approved"
  | "In Production"
  | "Post Production"
  | "Delivered"
  | "Completed"
  | "Cancelled";

export interface CompanyProfile {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  gstNumber?: string;
  panNumber?: string;
  bankDetails?: string;
  upiDetails?: string;
  paymentTerms: string;
  invoiceNotes: string;
  quotationTerms: string;
}

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  billingAddress: string;
  currency: Currency;
  gst: string;
  paymentTerms: string;
  notes: string;
  outstandingBalance: number;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  description: string;
  startDate: string;
  shootDate: string;
  deliveryDate: string;
  quotationAmount: number;
  invoiceAmount: number;
  paymentsReceived: number;
  projectExpenses: number;
  status: ProjectStatus;
  billingStatus: InvoiceStatus;
  notes: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  discount: number;
  tax: number;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  projectId: string;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  outstanding: number;
  items: InvoiceItem[];
  notes: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  clientId: string;
  projectId: string;
  amount: number;
  date: string;
  method: string;
  reference: string;
  notes: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  vendor: string;
  amount: number;
  projectId?: string;
  method: string;
  reference: string;
  notes: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  direction: "up" | "down" | "neutral";
}
