"use client";

import { FormEvent, useState } from "react";
import { formatCurrency } from "@/lib/mock-data";
import { ToastNotification } from "@/components/toast-notification";

type ExpenseRecord = { id: string; category: string; vendor: string; amount: number; date: string; method: string; projectName: string | null };

export function ExpenseList({ expenses }: { expenses: ExpenseRecord[] }) {
  const [records, setRecords] = useState(expenses);
  const [pending, setPending] = useState<ExpenseRecord | null>(null);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<ExpenseRecord | null>(null);

  async function deleteExpense(expense: ExpenseRecord) {
    const response = await fetch("/api/expenses", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: expense.id }) });
    if (response.ok) {
      setRecords((current) => current.filter((record) => record.id !== expense.id));
      setPending(null);
      setMessage("Expense deleted.");
      return;
    }
    const result = await response.json();
    setPending(null);
    setMessage(result.error ?? "Unable to delete this expense.");
  }

  async function updateExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/expenses", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, category: data.get("category"), vendor: data.get("vendor"), amount: Number(data.get("amount")), date: data.get("date"), method: data.get("method") }) });
    if (!response.ok) { setMessage((await response.json()).error ?? "Unable to update this expense."); return; }
    const saved = await response.json();
    setRecords((current) => current.map((record) => record.id === saved.id ? { ...record, category: saved.category, vendor: saved.vendor, amount: saved.amount, date: saved.date.slice(0, 10), method: saved.method } : record));
    setEditing(null); setMessage("Expense updated.");
  }

  return <>
    {message && <ToastNotification message={message} onDismiss={() => setMessage("")} />}
    {pending && <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="expense-delete-title"><div className="confirm-dialog-card"><p className="eyebrow">Confirm deletion</p><h3 id="expense-delete-title">Delete this expense?</h3><p>{pending.category} from {pending.vendor} for {formatCurrency(pending.amount)} will be removed.</p><div className="confirm-dialog-actions"><button className="secondary-button" type="button" onClick={() => setPending(null)}>Cancel</button><button className="danger-button" type="button" onClick={() => void deleteExpense(pending)}>Delete expense</button></div></div></div>}
    {editing && <div className="confirm-dialog" role="dialog" aria-modal="true"><form className="confirm-dialog-card form-grid" onSubmit={updateExpense}><p className="eyebrow">Edit expense</p><label>Category<input name="category" required defaultValue={editing.category} /></label><label>Vendor<input name="vendor" required defaultValue={editing.vendor} /></label><label>Amount<input name="amount" required type="number" min="1" defaultValue={editing.amount} /></label><label>Date<input name="date" required type="date" defaultValue={editing.date} /></label><label>Method<select name="method" defaultValue={editing.method}><option>Bank Transfer</option><option>UPI</option><option>Cash</option><option>Card</option></select></label><div className="confirm-dialog-actions"><button className="secondary-button" type="button" onClick={() => setEditing(null)}>Cancel</button><button className="primary-button" type="submit">Save changes</button></div></form></div>}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{records.length ? records.map((expense) => <article key={expense.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold">{expense.category}</h2><p className="text-sm text-slate-500">{expense.vendor}</p></div><div className="record-actions"><button className="text-button" type="button" onClick={() => setEditing(expense)}>Edit</button><button className="remove-button" type="button" aria-label={`Delete ${expense.category} expense`} onClick={() => setPending(expense)}>×</button></div></div><div className="mt-4 flex items-end justify-between gap-3 text-sm text-slate-600"><div><p>{expense.date}</p><p>{expense.method}{expense.projectName ? ` · ${expense.projectName}` : " · General"}</p></div><span className="text-lg font-semibold text-slate-900">{formatCurrency(expense.amount)}</span></div></article>) : <p className="muted">No expenses recorded yet.</p>}</div>
  </>;
}