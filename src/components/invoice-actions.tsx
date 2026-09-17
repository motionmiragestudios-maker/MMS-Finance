"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ToastNotification } from "@/components/toast-notification";

export function InvoiceActions({ invoiceId }: { invoiceId: string }) {
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();
  async function deleteInvoice() {
    const response = await fetch(`/api/invoices?id=${invoiceId}`, { method: "DELETE" });
    if (!response.ok) { setMessage((await response.json()).error ?? "Unable to delete invoice."); return; }
    router.push("/invoices");
  }
  return <div className="record-actions">{message && <ToastNotification message={message} onDismiss={() => setMessage("")} />}{confirming && <div className="confirm-dialog" role="dialog" aria-modal="true"><div className="confirm-dialog-card"><p className="eyebrow">Confirm deletion</p><h3>Delete this invoice?</h3><p>The invoice and its line items will be removed.</p><div className="confirm-dialog-actions"><button className="secondary-button" type="button" onClick={() => setConfirming(false)}>Cancel</button><button className="danger-button" type="button" onClick={() => void deleteInvoice()}>Delete invoice</button></div></div></div>}<button className="secondary-button" type="button" onClick={() => window.print()}>Download / Print</button><Link className="secondary-button" href={`/create-invoice?edit=${invoiceId}`}>Edit</Link><button className="danger-button" type="button" onClick={() => setConfirming(true)}>Delete</button></div>;
}