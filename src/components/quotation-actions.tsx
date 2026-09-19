"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function QuotationActions({ quotationId, showPrint = true }: { quotationId: string; showPrint?: boolean }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  async function deleteQuotation() {
    setDeleting(true);
    const response = await fetch(`/api/projects?id=${quotationId}`, { method: "DELETE" });
    if (!response.ok) {
      setMessage((await response.json()).error ?? "Unable to delete this quotation.");
      setDeleting(false);
      return;
    }
    router.push("/projects");
  }

  return <div className="record-actions">
    {message && <span className="login-error" role="alert">{message}</span>}
    {showPrint && <button className="secondary-button" type="button" onClick={() => window.print()}>Download / Print</button>}
    <button className="danger-button" type="button" disabled={deleting} onClick={() => { if (window.confirm("Delete this quotation and its linked records?")) void deleteQuotation(); }}>{deleting ? "Deleting..." : "Delete"}</button>
  </div>;
}