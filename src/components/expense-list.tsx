"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/mock-data";
import { ToastNotification } from "@/components/toast-notification";

type ExpenseRecord = { id: string; category: string; vendor: string; amount: number; date: string; method: string; projectName: string | null };

export function ExpenseList({ expenses }: { expenses: ExpenseRecord[] }) {
  const [records, setRecords] = useState(expenses);
  const [pending, setPending] = useState<ExpenseRecord | null>(null);
  const [message, setMessage] = useState("");

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

  return <>
    {message && <ToastNotification message={message} onDismiss={() => setMessage("")} />}
    {pending && <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="expense-delete-title"><div className="confirm-dialog-card"><p className="eyebrow">Confirm deletion</p><h3 id="expense-delete-title">Delete this expense?</h3><p>{pending.category} from {pending.vendor} for {formatCurrency(pending.amount)} will be removed.</p><div className="confirm-dialog-actions"><button className="secondary-button" type="button" onClick={() => setPending(null)}>Cancel</button><button className="danger-button" type="button" onClick={() => void deleteExpense(pending)}>Delete expense</button></div></div></div>}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{records.length ? records.map((expense) => <article key={expense.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold">{expense.category}</h2><p className="text-sm text-slate-500">{expense.vendor}</p></div><button className="remove-button" type="button" aria-label={`Delete ${expense.category} expense`} onClick={() => setPending(expense)}>×</button></div><div className="mt-4 flex items-end justify-between gap-3 text-sm text-slate-600"><div><p>{expense.date}</p><p>{expense.method}{expense.projectName ? ` · ${expense.projectName}` : " · General"}</p></div><span className="text-lg font-semibold text-slate-900">{formatCurrency(expense.amount)}</span></div></article>) : <p className="muted">No expenses recorded yet.</p>}</div>
  </>;
}