"use client";

import { FormEvent, useState } from "react";

type Option = { id: string; name?: string; number?: string };
type Props = { kind: "project" | "payment" | "expense"; clients?: Option[]; invoices?: Option[]; projects?: Option[] };

export function FinanceRecordForm({ kind, clients = [], invoices = [], projects = [] }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<Record<string, string>>({});
  const title = kind === "project" ? "New project" : kind === "payment" ? "Record payment" : "Add expense";
  function update(field: string, value: string) { setForm((current) => ({ ...current, [field]: value })); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("");
    const response = await fetch(`/api/${kind === "project" ? "projects" : kind === "payment" ? "payments" : "expenses"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error ?? "Unable to save record."); return; }
    window.location.reload();
  }
  return <div className="finance-record-form"><button className="primary-button" type="button" onClick={() => setOpen((current) => !current)}>{open ? "Close" : title}</button>{open && <form className="settings-panel" onSubmit={submit}><div className="form-grid two-columns">
    {kind === "project" && <><label>Project name<input required value={form.name ?? ""} onChange={(event) => update("name", event.target.value)} /></label><label>Client<select required value={form.clientId ?? ""} onChange={(event) => update("clientId", event.target.value)}><option value="">Choose client</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label><label>Start date<input required type="date" value={form.startDate ?? ""} onChange={(event) => update("startDate", event.target.value)} /></label><label>Shoot date<input required type="date" value={form.shootDate ?? ""} onChange={(event) => update("shootDate", event.target.value)} /></label><label>Delivery date<input required type="date" value={form.deliveryDate ?? ""} onChange={(event) => update("deliveryDate", event.target.value)} /></label><label>Quotation amount<input required type="number" min="0" value={form.quotationAmount ?? ""} onChange={(event) => update("quotationAmount", event.target.value)} /></label></>}
    {kind === "payment" && <><label>Invoice<select required value={form.invoiceId ?? ""} onChange={(event) => update("invoiceId", event.target.value)}><option value="">Choose invoice</option>{invoices.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.number}</option>)}</select></label><label>Amount<input required type="number" min="1" value={form.amount ?? ""} onChange={(event) => update("amount", event.target.value)} /></label><label>Date<input required type="date" value={form.date ?? ""} onChange={(event) => update("date", event.target.value)} /></label><label>Method<select value={form.method ?? "Bank Transfer"} onChange={(event) => update("method", event.target.value)}><option>Bank Transfer</option><option>UPI</option><option>Cash</option><option>Card</option></select></label><label>Reference<input value={form.reference ?? ""} onChange={(event) => update("reference", event.target.value)} /></label></>}
    {kind === "expense" && <><label>Category<input required value={form.category ?? ""} onChange={(event) => update("category", event.target.value)} /></label><label>Vendor<input required value={form.vendor ?? ""} onChange={(event) => update("vendor", event.target.value)} /></label><label>Amount<input required type="number" min="1" value={form.amount ?? ""} onChange={(event) => update("amount", event.target.value)} /></label><label>Date<input required type="date" value={form.date ?? ""} onChange={(event) => update("date", event.target.value)} /></label><label>Project<select value={form.projectId ?? ""} onChange={(event) => update("projectId", event.target.value)}><option value="">General expense</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label><label>Method<select value={form.method ?? "Bank Transfer"} onChange={(event) => update("method", event.target.value)}><option>Bank Transfer</option><option>UPI</option><option>Cash</option><option>Card</option></select></label></>}
  </div>{message && <p className="login-error">{message}</p>}<button className="primary-button" type="submit">Save {kind}</button></form>}</div>;
}