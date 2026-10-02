import type { CompanyProfile } from "@/types/finance";

export type WorkspaceClient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  billingAddress: string;
  gst: string;
  notes?: string;
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

export type SharedCompanyProfile = { profile: CompanyProfile; logoData: string; faviconData: string; legacySettingsMigrated: boolean };

export async function loadSharedCompanyProfile(): Promise<SharedCompanyProfile | null> {
  const response = await fetch("/api/company-profile", { cache: "no-store" });
  if (!response.ok) return null;
  return response.json();
}

export const workspaceKeys = {
  company: "motion-mirage-company",
  logo: "motion-mirage-logo",
  favicon: "motion-mirage-favicon",
  clients: "motion-mirage-clients",
  vendors: "motion-mirage-vendors",
} as const;

export function readSessionValue(key: string) {
  try {
    return window.sessionStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

export function writeSessionValue(key: string, value: string) {
  try {
    if (value) window.sessionStorage.setItem(key, value);
    else window.sessionStorage.removeItem(key);
  } catch {
    // no-op: storage can be unavailable in some restricted browser contexts
  }
}

export function clearBrandingSession() {
  writeSessionValue(workspaceKeys.logo, "");
  writeSessionValue(workspaceKeys.favicon, "");
}

export function normalizeIndianPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "");
  const hasCountryCode = value.trim().startsWith("+91") || (digits.length > 10 && digits.startsWith("91"));
  return hasCountryCode ? digits.slice(2, 12) : digits.slice(0, 10);
}

export function formatIndianPhone(value: string) {
  const digits = normalizeIndianPhoneInput(value);
  return digits.length === 10 ? `+91${digits}` : "";
}
