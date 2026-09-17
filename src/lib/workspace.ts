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
  bankAccountName: "",
  bankName: "",
  bankAccountNumber: "",
  bankBranch: "",
  bankIfsc: "",
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

export function normalizeIndianPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "");
  const hasCountryCode = value.trim().startsWith("+91") || (digits.length > 10 && digits.startsWith("91"));
  return hasCountryCode ? digits.slice(2, 12) : digits.slice(0, 10);
}

export function formatIndianPhone(value: string) {
  const digits = normalizeIndianPhoneInput(value);
  return digits.length === 10 ? `+91${digits}` : "";
}
