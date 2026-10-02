"use client";

import { useEffect, useState } from "react";
import { loadSharedCompanyProfile } from "@/lib/workspace";

type BrandWordmarkProps = {
  className?: string;
  compact?: boolean;
};

export function BrandWordmark({ className = "", compact = false }: BrandWordmarkProps) {
  const [logo, setLogo] = useState("");

  useEffect(() => {
    const load = async () => setLogo((await loadSharedCompanyProfile())?.logoData ?? "");
    void load();
    window.addEventListener("motion-mirage-logo-updated", load);
    return () => window.removeEventListener("motion-mirage-logo-updated", load);
  }, []);

  if (!logo) return null;

  return (
    <img
      src={logo}
      alt="Motion Mirage Studios"
      className={`brand-logo ${compact ? "brand-logo--compact" : ""} ${className}`.trim()}
      aria-label="Motion Mirage Studios"
    />
  );
}
