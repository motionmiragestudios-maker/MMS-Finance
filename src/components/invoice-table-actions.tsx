"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ToastNotification } from "@/components/toast-notification";

export function InvoiceTableActions({ invoiceId, invoiceNumber }: { invoiceId: string; invoiceNumber: string }) {
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function deleteInvoice() {
    const response = await fetch(`/api/invoices?id=${invoiceId}`, { method: "DELETE" });
    if (!response.ok) {
      setConfirming(false);
      setMessage((await response.json()).error ?? "Unable to delete invoice.");
      return;
    }
    router.refresh();
  }

  return <>
    {message && <ToastNotification message={message} onDismiss={() => setMessage("")} />}
    {confirming && <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby={`delete-invoice-${invoiceId}`}>
      <div className="confirm-dialog-card">
        <p className="eyebrow">Confirm deletion</p>
        <h3 id={`delete-invoice-${invoiceId}`}>Delete {invoiceNumber}?</h3>
        <p>The invoice, line items, and linked payments will be removed.</p>
        <div className="confirm-dialog-actions">
          <button className="secondary-button" type="button" onClick={() => setConfirming(false)}>Cancel</button>
          <button className="danger-button" type="button" onClick={() => void deleteInvoice()}>Delete invoice</button>
        </div>
      </div>
    </div>}
    <div className="invoice-table-actions">
      <Link href={`/invoices/${invoiceId}`} aria-label={`View ${invoiceNumber}`} title="View invoice">View</Link>
      <Link href={`/create-invoice?edit=${invoiceId}`} aria-label={`Edit ${invoiceNumber}`} title="Edit invoice">Edit</Link>
      <Link href={`/invoices/${invoiceId}#print`} aria-label={`Download ${invoiceNumber}`} title="Download invoice">PDF</Link>
      <button className="table-delete-button" type="button" onClick={() => setConfirming(true)}>Delete</button>
    </div>
  </>;
}
