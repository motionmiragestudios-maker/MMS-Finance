"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { loadSharedCompanyProfile } from "@/lib/workspace";

export function FaviconSync() {
  const pathname = usePathname();

  useEffect(() => {
    const sync = async () => {
      const favicon = (await loadSharedCompanyProfile())?.faviconData || "/favicon.svg";

      let iconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
      if (!iconLink) {
        iconLink = document.createElement("link");
        iconLink.rel = "icon";
        document.head.appendChild(iconLink);
      }

      iconLink.href = favicon;
    };

    void sync();
    window.addEventListener("motion-mirage-logo-updated", sync);
    return () => window.removeEventListener("motion-mirage-logo-updated", sync);
  }, [pathname]);

  return null;
}
