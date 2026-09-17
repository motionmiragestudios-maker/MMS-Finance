"use client";

import { FormEvent, useState } from "react";
import { formatCurrency } from "@/lib/mock-data";
import { ToastNotification } from "@/components/toast-notification";

type PaymentRecord = { id: string; clientName: string; amount: number; reference: string; method: string; date: string };

export function PaymentList({ payments }: { payments: PaymentRecord[] }) {
  const [records, setRecords] = useState(payments);
  const [editing, setEditing] = useState<PaymentRecord | null>(null);
  const [message, setMessage] = useState("");

  async function updatePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/payments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, amount: Number(data.get("amount")), date: data.get("date"), method: data.get("method"), reference: data.get("reference") }) });
    if (!response.ok) { setMessage((await response.json()).error ?? "Unable to update this payment."); return; }
    const saved = await response.json();
    setRecords((current) => current.map((record) => record.id === saved.id ? { ...record, amount: saved.amount, date: saved.date.slice(0, 10), method: saved.method, reference: saved.reference } : record));
    setEditing(null); setMessage("Payment updated.");
  }

  return <>
    {message && <ToastNotification message={message} onDismiss={() => setMessage("")} />}
    {editing && <div className="confirm-dialog" role="dialog" aria-modal="true"><form className="confirm-dialog-card form-grid" onSubmit={updatePayment}><p className="eyebrow">Edit payment</p><p className="muted">{editing.clientName}</p><label>Amount<input name="amount" required type="number" min="1" defaultValue={editing.amount} /></label><label>Date<input name="date" required type="date" defaultValue={editing.date} /></label><label>Method<select name="method" defaultValue={editing.method}><option>Bank Transfer</option><option>UPI</option><option>Cash</option><option>Card</option></select></label><label>Reference<input name="reference" defaultValue={editing.reference} /></label><div className="confirm-dialog-actions"><button className="secondary-button" type="button" onClick={() => setEditing(null)}>Cancel</button><button className="primary-button" type="submit">Save changes</button></div></form></div>}
    <div className="space-y-4">{records.map((payment) => <div key={payment.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-4"><div><div className="text-lg font-semibold text-slate-900">{payment.clientName}</div><div className="text-sm text-slate-500">{payment.reference} · {payment.method} · {payment.date}</div></div><div className="record-actions"><div className="text-right"><div className="text-lg font-semibold">{formatCurrency(payment.amount)}</div><div className="text-xs text-slate-500">Received</div></div><button className="text-button" type="button" onClick={() => setEditing(payment)}>Edit</button></div></div></div>)}</div>
  </>;
}