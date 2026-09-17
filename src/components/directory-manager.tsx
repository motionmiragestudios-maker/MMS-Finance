"use client";

import { FormEvent, useEffect, useState } from "react";
import { workspaceKeys, type WorkspaceClient, type WorkspaceVendor } from "@/lib/workspace";

type DirectoryManagerProps = { kind: "clients" | "vendors" };
type RecordItem = WorkspaceClient | WorkspaceVendor;

export function DirectoryManager({ kind }: DirectoryManagerProps) {
  const isClient = kind === "clients";
  const storageKey = isClient ? workspaceKeys.clients : workspaceKeys.vendors;
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", gst: "", notes: "" });

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) setRecords(JSON.parse(stored));
  }, [storageKey]);

  function update(field: keyof typeof form, value: string) { setForm((current) => ({ ...current, [field]: value })); }

  function addRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) return;
    const record: RecordItem = isClient
      ? { id: crypto.randomUUID(), name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), billingAddress: form.address.trim(), gst: form.gst.trim() }
      : { id: crypto.randomUUID(), name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), notes: form.notes.trim() };
    const next = [...records, record];
    setRecords(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    setForm({ name: "", email: "", phone: "", address: "", gst: "", notes: "" });
    setIsAdding(false);
  }

  function removeRecord(id: string) {
    const next = records.filter((record) => record.id !== id);
    setRecords(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  return <div className="directory-layout"><section className="directory-toolbar"><div><p className="eyebrow">{isClient ? "Client book" : "Supplier book"}</p><h2>{isClient ? "Your clients" : "Your vendors"}</h2><p className="muted">{records.length ? `${records.length} saved record${records.length === 1 ? "" : "s"}` : "No records yet. Add the first one when you are ready."}</p></div><button className="primary-button" type="button" onClick={() => setIsAdding((current) => !current)}>{isAdding ? "Close" : isClient ? "Add client" : "Add vendor"}</button></section>
    {isAdding && <form className="directory-form settings-panel" onSubmit={addRecord}><div className="form-grid two-columns"><label>Name or company<input required autoFocus value={form.name} onChange={(event) => update("name", event.target.value)} /></label><label>Email<input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} /></label><label>Phone<input value={form.phone} onChange={(event) => update("phone", event.target.value)} /></label>{isClient ? <><label>GST number<input value={form.gst} onChange={(event) => update("gst", event.target.value)} /></label><label className="wide-field">Billing address<textarea rows={2} value={form.address} onChange={(event) => update("address", event.target.value)} /></label></> : <label className="wide-field">Notes<textarea rows={2} value={form.notes} onChange={(event) => update("notes", event.target.value)} /></label>}</div><button className="primary-button" type="submit">Save {isClient ? "client" : "vendor"}</button></form>}
    {records.length === 0 && !isAdding ? <div className="empty-state"><span className="empty-icon">+</span><h3>No {isClient ? "clients" : "vendors"} yet</h3><p>Add a record to reuse it in your workflows and invoices.</p><button className="secondary-button" type="button" onClick={() => setIsAdding(true)}>Add your first {isClient ? "client" : "vendor"}</button></div> : <div className="directory-grid">{records.map((record) => <article className="directory-card" key={record.id}><div className="directory-card-top"><div className="record-avatar">{record.name.slice(0, 1).toUpperCase()}</div><div><h3>{record.name}</h3><p>{record.email || "No email added"}</p></div><button className="remove-button" type="button" aria-label={`Remove ${record.name}`} onClick={() => removeRecord(record.id)}>×</button></div><div className="directory-details"><span>{record.phone || "No phone added"}</span>{isClient && <span>{(record as WorkspaceClient).billingAddress || "No address added"}</span>}{!isClient && <span>{(record as WorkspaceVendor).notes || "No notes added"}</span>}</div></article>)}</div>}
  </div>;
}
