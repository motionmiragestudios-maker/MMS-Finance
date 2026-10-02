"use client";

import { useEffect, useState } from "react";
import { defaultCompanyProfile, loadSharedCompanyProfile } from "@/lib/workspace";
import type { CompanyProfile } from "@/types/finance";

export function QuotationDocumentHeader() {
  const [company, setCompany] = useState<CompanyProfile>(defaultCompanyProfile);
  const [logo, setLogo] = useState("");

  useEffect(() => {
    const load = async () => {
      const shared = await loadSharedCompanyProfile();
      setCompany(shared ? { ...defaultCompanyProfile, ...shared.profile } : defaultCompanyProfile);
      setLogo(shared?.logoData ?? "");
    };
    void load();
    window.addEventListener("motion-mirage-logo-updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("motion-mirage-logo-updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  return <div className="quotation-brand"><div><p className="eyebrow">Quotation</p><strong>{company.name}</strong><span>{company.tagline}</span><span>{company.address}</span><span>{company.email}</span></div>{logo && <img className="invoice-logo" src={logo} alt={`${company.name} logo`} />}</div>;
}