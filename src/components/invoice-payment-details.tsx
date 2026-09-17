"use client";

import { useEffect, useState } from "react";
import { defaultCompanyProfile, workspaceKeys } from "@/lib/workspace";
import type { CompanyProfile } from "@/types/finance";
import { UpiQr } from "@/components/upi-qr";

type InvoicePaymentDetailsProps = { amount: number; fallbackUpi?: string };

export function InvoicePaymentDetails({ amount, fallbackUpi = "" }: InvoicePaymentDetailsProps) {
  const [profile, setProfile] = useState<CompanyProfile>({ ...defaultCompanyProfile, upiDetails: fallbackUpi });
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = localStorage.getItem(workspaceKeys.company);
      if (stored) setProfile({ ...defaultCompanyProfile, ...JSON.parse(stored) });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const bank = [
    profile.bankAccountName && `Account name: ${profile.bankAccountName}`,
    profile.bankName && `Bank: ${profile.bankName}`,
    profile.bankAccountNumber && `Account no: ${profile.bankAccountNumber}`,
    profile.bankBranch && `Branch: ${profile.bankBranch}`,
    profile.bankIfsc && `IFSC: ${profile.bankIfsc}`,
  ].filter(Boolean) as string[];
  return <><div className="invoice-bank-details">{bank.map((detail) => <span key={detail}>{detail}</span>)}</div><UpiQr upiId={profile.upiDetails ?? ""} amount={amount} /></>;
}
