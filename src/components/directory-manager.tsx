"use client";

import { FormEvent, useEffect, useState } from "react";
import { formatIndianPhone, normalizeIndianPhoneInput, type WorkspaceClient, type WorkspaceVendor } from "@/lib/workspace";
import { ToastNotification } from "@/components/toast-notification";

type DirectoryManagerProps = { kind: "clients" | "vendors" };
type RecordItem = WorkspaceClient | WorkspaceVendor;

export function DirectoryManager({ kind }: DirectoryManagerProps) {
  const isClient = kind === "clients";
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [recordToDelete, setRecordToDelete] = useState<RecordItem | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", gst: "", notes: "" });

  useEffect(() => {
    const load = async () => {
      const response = await fetch(`/api/${isClient ? "clients" : "vendors"}`);
      if (response.ok) setRecords(await response.json());
    };
    void load();
  }, [isClient]);

  function update(field: keyof typeof form, value: string) { setForm((current) => ({ ...current, [field]: field === "phone" ? normalizeIndianPhoneInput(value) : value })); }

  async function addRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const normalizedPhone = formatIndianPhone(form.phone);
    const record: RecordItem = isClient
      ? { id: crypto.randomUUID(), name: form.name.trim(), email: form.email.trim(), phone: normalizedPhone, billingAddress: form.address.trim(), gst: form.gst.trim() }
      : { id: crypto.randomUUID(), name: form.name.trim(), email: form.email.trim(), phone: normalizedPhone, notes: form.notes.trim() };
    const response = await fetch(`/api/${isClient ? "clients" : "vendors"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record) });
    if (!response.ok) {
      const result = await response.json();
      setMessage(result.error ?? "Unable to save record.");
      return;
    }
    const savedRecord = await response.json();
    setRecords((current) => [...current, savedRecord]);
    setForm({ name: "", email: "", phone: "", address: "", gst: "", notes: "" });
    setIsAdding(false);
  }

  async function removeRecord(record: RecordItem) {
    const response = await fetch(`/api/${isClient ? "clients" : "vendors"}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: record.id }) });
    if (response.ok) {
      setRecords((current) => current.filter((currentRecord) => currentRecord.id !== record.id));
      setRecordToDelete(null);
      setMessage(`${isClient ? "Client" : "Vendor"} deleted.`);
      return;
    }
    const result = await response.json();
    setMessage(result.error ?? `Unable to delete ${isClient ? "client" : "vendor"}.`);
    setRecordToDelete(null);
  }

  return <div className="directory-layout"><section className="directory-toolbar"><div><p className="eyebrow">{isClient ? "Client book" : "Supplier book"}</p><h2>{isClient ? "Your clients" : "Your vendors"}</h2><p className="muted">{records.length ? `${records.length} saved record${records.length === 1 ? "" : "s"}` : "No records yet. Add the first one when you are ready."}</p></div><button className="primary-button" type="button" onClick={() => { setMessage(""); setIsAdding((current) => !current); }}>{isAdding ? "Close" : isClient ? "Add client" : "Add vendor"}</button></section>
    {message && <ToastNotification message={message} onDismiss={() => setMessage("")} />}
    {recordToDelete && <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-title"><div className="confirm-dialog-card"><p className="eyebrow">Confirm deletion</p><h3 id="delete-title">Delete {recordToDelete.name}?</h3><p>{isClient ? "All linked projects, invoices, payments, and expenses will also be deleted." : "This vendor will be removed from your directory."}</p><div className="confirm-dialog-actions"><button className="secondary-button" type="button" onClick={() => setRecordToDelete(null)}>Cancel</button><button className="danger-button" type="button" onClick={() => void removeRecord(recordToDelete)}>Delete {isClient ? "client" : "vendor"}</button></div></div></div>}
    {isAdding && <form className="directory-form settings-panel" onSubmit={addRecord}><div className="form-grid two-columns"><label>Name or company<input required autoFocus value={form.name} onChange={(event) => update("name", event.target.value)} /></label><label>Email<input required type="email" value={form.email} onChange={(event) => update("email", event.target.value)} /></label><label>Phone <span className="field-hint">+91 is added automatically</span><input required type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} placeholder="9876543210" title="Enter 10 digits; +91 is added automatically" value={form.phone} onChange={(event) => update("phone", event.target.value)} /></label>{isClient ? <><label>GST number<input value={form.gst} onChange={(event) => update("gst", event.target.value)} /></label><label className="wide-field">Billing address<textarea required rows={2} value={form.address} onChange={(event) => update("address", event.target.value)} /></label></> : <label className="wide-field">Notes<textarea rows={2} value={form.notes} onChange={(event) => update("notes", event.target.value)} /></label>}</div>{message && <p className="login-error" role="alert">{message}</p>}<button className="primary-button" type="submit">Save {isClient ? "client" : "vendor"}</button></form>}
    {records.length === 0 && !isAdding ? <div className="empty-state"><span className="empty-icon">+</span><h3>No {isClient ? "clients" : "vendors"} yet</h3><p>Add a record to reuse it in your workflows and invoices.</p><button className="secondary-button" type="button" onClick={() => setIsAdding(true)}>Add your first {isClient ? "client" : "vendor"}</button></div> : <div className="directory-grid">{records.map((record) => <article className="directory-card" key={record.id}><div className="directory-card-top"><div className="record-avatar">{record.name.slice(0, 1).toUpperCase()}</div><div><h3>{record.name}</h3><p>{record.email || "No email added"}</p></div><button className="remove-button" type="button" aria-label={`Remove ${record.name}`} onClick={() => setRecordToDelete(record)}>×</button></div><div className="directory-details"><span>{record.phone || "No phone added"}</span>{isClient && <span>{(record as WorkspaceClient).billingAddress || "No address added"}</span>}{!isClient && <span>{(record as WorkspaceVendor).notes || "No notes added"}</span>}</div></article>)}</div>}
  </div>;
}
