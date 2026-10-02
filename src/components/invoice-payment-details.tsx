"use client";

import { useEffect, useState } from "react";
import { defaultCompanyProfile, loadSharedCompanyProfile } from "@/lib/workspace";
import type { CompanyProfile } from "@/types/finance";
import { UpiQr } from "@/components/upi-qr";

type InvoicePaymentDetailsProps = { amount: number; fallbackUpi?: string };

export function InvoicePaymentDetails({ amount, fallbackUpi = "" }: InvoicePaymentDetailsProps) {
  const [profile, setProfile] = useState<CompanyProfile>({ ...defaultCompanyProfile, upiDetails: fallbackUpi });
  useEffect(() => {
    let active = true;
    void loadSharedCompanyProfile().then((shared) => {
      if (active && shared) setProfile({ ...defaultCompanyProfile, ...shared.profile });
    });
    return () => { active = false; };
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
