"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ToastNotification } from "@/components/toast-notification";

type Props = { invoiceId: string; invoiceNumber: string; outstanding: number };

export function InvoicePaymentButton({ invoiceId, invoiceNumber, outstanding }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function recordPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invoiceId, amount: Number(data.get("amount")), date: data.get("date"), method: data.get("method"), reference: data.get("reference") }) });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error ?? "Unable to record payment."); return; }
    setOpen(false);
    setMessage("Payment recorded.");
    router.refresh();
  }

  if (!outstanding) return <span className="paid-label">Paid</span>;

  return <>
    {message && <ToastNotification message={message} onDismiss={() => setMessage("")} />}
    <button className="paid-button" type="button" onClick={() => setOpen(true)}>Paid</button>
    {open && <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby={`record-payment-${invoiceId}`}>
      <form className="confirm-dialog-card form-grid" onSubmit={recordPayment}>
        <p className="eyebrow">Invoice payment</p>
        <h3 id={`record-payment-${invoiceId}`}>Record payment for {invoiceNumber}</h3>
        <label>Amount<input name="amount" required type="number" min="1" max={outstanding} defaultValue={outstanding} /></label>
        <label>Date<input name="date" required type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></label>
        <label>Method<select name="method" defaultValue="Bank Transfer"><option>Bank Transfer</option><option>UPI</option><option>Cash</option><option>Card</option></select></label>
        <label>Reference<input name="reference" placeholder="Optional reference" /></label>
        <div className="confirm-dialog-actions"><button className="secondary-button" type="button" onClick={() => setOpen(false)}>Cancel</button><button className="primary-button" type="submit">Record payment</button></div>
      </form>
    </div>}
  </>;
}