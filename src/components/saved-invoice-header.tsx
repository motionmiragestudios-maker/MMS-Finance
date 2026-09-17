"use client";

import { useEffect, useState } from "react";
import { defaultCompanyProfile, workspaceKeys } from "@/lib/workspace";
import type { CompanyProfile } from "@/types/finance";

type SavedInvoiceHeaderProps = { fallbackUpi?: string };

export function SavedInvoiceHeader({ fallbackUpi }: SavedInvoiceHeaderProps) {
  const [company, setCompany] = useState<CompanyProfile>(defaultCompanyProfile);
  const [logo, setLogo] = useState("");

  useEffect(() => {
    const load = () => {
      const storedProfile = localStorage.getItem(workspaceKeys.company);
      const storedLogo = localStorage.getItem(workspaceKeys.logo);
      setCompany(storedProfile ? { ...defaultCompanyProfile, ...JSON.parse(storedProfile) } : { ...defaultCompanyProfile, upiDetails: fallbackUpi ?? "" });
      setLogo(storedLogo ?? "");
    };
    load();
    window.addEventListener("motion-mirage-logo-updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("motion-mirage-logo-updated", load);
      window.removeEventListener("storage", load);
    };
  }, [fallbackUpi]);

  return <header className="invoice-header"><div><h2>INVOICE</h2><div className="company-details"><strong>{company.name}</strong><span>{company.tagline}</span><span>{company.address || "Company address"}</span><span>{company.phone && `Phone: ${company.phone}`}</span><span>{company.email && `Email: ${company.email}`}</span><span>{company.website}</span></div></div>{logo ? <img className="invoice-logo" src={logo} alt={`${company.name} logo`} /> : <div className="brand-mark"><span>MOTION</span><b>MIRAGE</b><small>STUDIOS</small></div>}</header>;
}
