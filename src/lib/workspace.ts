import type { CompanyProfile } from "@/types/finance";

export type WorkspaceClient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  billingAddress: string;
  gst: string;
};

export type WorkspaceVendor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
};

export const defaultCompanyProfile: CompanyProfile = {
  name: "Motion Mirage Studios",
  tagline: "A Production Agency",
  address: "",
  phone: "",
  email: "",
  website: "",
  gstNumber: "",
  panNumber: "",
  bankDetails: "",
  upiDetails: "",
  paymentTerms: "Payment due within 15 days from invoice date.",
  invoiceNotes: "Thank you for choosing Motion Mirage Studios.",
  quotationTerms: "This quotation is valid for 15 days from the date of issue.",
};

export const workspaceKeys = {
  company: "motion-mirage-company",
  logo: "motion-mirage-logo",
  clients: "motion-mirage-clients",
  vendors: "motion-mirage-vendors",
} as const;
