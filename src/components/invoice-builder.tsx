"use client";

import { useEffect, useState } from "react";
import { defaultCompanyProfile, workspaceKeys, type WorkspaceClient } from "@/lib/workspace";
import type { CompanyProfile } from "@/types/finance";

type LineItem = { id: number; description: string; quantity: number; rate: number };

const emptyItem = (): LineItem => ({ id: Date.now(), description: "", quantity: 1, rate: 0 });
const formatCurrency = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
const formatDate = (value: string) => value ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${value}T00:00:00`)) : "Select date";

export function InvoiceBuilder() {
  const [company, setCompany] = useState<CompanyProfile>(defaultCompanyProfile);
  const [logo, setLogo] = useState("");
  const [clients, setClients] = useState<WorkspaceClient[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [clientId, setClientId] = useState("new");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const today = new Date().toISOString().slice(0, 10);
      const storedCompany = localStorage.getItem(workspaceKeys.company);
      const storedLogo = localStorage.getItem(workspaceKeys.logo);
      const storedClients = localStorage.getItem(workspaceKeys.clients);
      const parsedCompany = storedCompany ? JSON.parse(storedCompany) : defaultCompanyProfile;
      setCompany({ ...defaultCompanyProfile, ...parsedCompany });
      setLogo(storedLogo ?? "");
      setClients(storedClients ? JSON.parse(storedClients) : []);
      setInvoiceDate(today);
      setNotes(parsedCompany.invoiceNotes ?? defaultCompanyProfile.invoiceNotes);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const subtotal = items.reduce((total, item) => total + item.quantity * item.rate, 0);
  const selectedClient = clients.find((client) => client.id === clientId);

  function updateClient(value: string) {
    setClientId(value);
    const nextClient = clients.find((client) => client.id === value);
    setClientName(nextClient?.name ?? "");
    setClientEmail(nextClient?.email ?? "");
    setClientAddress(nextClient?.billingAddress ?? "");
  }

  function updateItem(id: number, field: keyof LineItem, value: string) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, [field]: field === "description" ? value : Number(value) } : item));
  }

  function addItem() { setItems((current) => [...current, emptyItem()]); }
  function removeItem(id: number) { setItems((current) => current.length === 1 ? current : current.filter((item) => item.id !== id)); }

  async function saveInvoice() {
    setIsSaving(true);
    setSaveMessage("");
    const response = await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invoiceNumber, invoiceDate, dueDate, clientId: clientId === "new" ? undefined : clientId, clientName, clientEmail, clientAddress, notes, items }) });
    const result = await response.json();
    setIsSaving(false);
    setSaveMessage(response.ok ? "Invoice saved securely." : result.error ?? "Unable to save invoice.");
  }

  return (
    <div className="invoice-workspace">
      <section className="invoice-editor no-print">
        <div className="editor-heading">
          <div><p className="eyebrow">Invoice studio</p><h1>Make it official.</h1><p className="muted">Start from a clean canvas. Your saved company details and logo will appear automatically.</p></div>
          <div className="editor-actions"><button className="secondary-button" type="button" onClick={saveInvoice} disabled={isSaving}>{isSaving ? "Saving..." : "Save invoice"}</button><button className="primary-button" type="button" onClick={() => window.print()}>Print / Save PDF</button></div>
        </div>
        {saveMessage && <p className="save-message" role="status">{saveMessage}</p>}

        <div className="editor-section"><div className="section-heading"><span>01</span><h2>Invoice details</h2></div><div className="form-grid three-columns"><label>Invoice number<input placeholder="e.g. MMS-INV-001" value={invoiceNumber} onChange={(event) => setInvoiceNumber(event.target.value)} /></label><label>Issue date<input type="date" value={invoiceDate} onChange={(event) => setInvoiceDate(event.target.value)} /></label><label>Due date<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label></div></div>

        <div className="editor-section"><div className="section-heading"><span>02</span><h2>Bill to</h2><a className="text-button" href="/clients">Manage clients</a></div><div className="form-grid two-columns"><label>Saved client<select value={clientId} onChange={(event) => updateClient(event.target.value)}><option value="new">New client</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label><label>Client name<input placeholder="Client or company name" value={clientName} onChange={(event) => setClientName(event.target.value)} /></label><label>Email<input type="email" placeholder="billing@email.com" value={clientEmail} onChange={(event) => setClientEmail(event.target.value)} /></label><label>Billing address<textarea rows={2} placeholder="Full billing address" value={clientAddress} onChange={(event) => setClientAddress(event.target.value)} /></label></div></div>

        <div className="editor-section"><div className="section-heading"><span>03</span><h2>Services</h2><button className="text-button" type="button" onClick={addItem}>+ Add line</button></div><div className="line-editor">{items.map((item) => <div className="line-row" key={item.id}><input aria-label="Service description" placeholder="What are you billing for?" value={item.description} onChange={(event) => updateItem(item.id, "description", event.target.value)} /><input aria-label="Quantity" type="number" min="1" value={item.quantity} onChange={(event) => updateItem(item.id, "quantity", event.target.value)} /><input aria-label="Rate" type="number" min="0" placeholder="0" value={item.rate || ""} onChange={(event) => updateItem(item.id, "rate", event.target.value)} /><button className="remove-button" type="button" aria-label="Remove line" onClick={() => removeItem(item.id)}>×</button></div>)}<div className="line-labels"><span>Description</span><span>Qty</span><span>Rate</span></div></div></div>

        <div className="editor-section"><div className="section-heading"><span>04</span><h2>Notes</h2></div><label className="full-label">Payment note<textarea rows={3} placeholder="Add payment terms or a personal note" value={notes} onChange={(event) => setNotes(event.target.value)} /></label></div>
      </section>

      <section className="invoice-preview-wrap"><div className="preview-toolbar no-print"><span>Live preview</span><span>A4 document</span></div><article className="invoice-paper">
        <header className="invoice-header"><div><p className="invoice-kicker">Tax invoice</p><h2>INVOICE</h2><div className="company-details"><strong>{company.name}</strong><span>{company.tagline}</span><span>{company.address || "Company address"}</span><span>{company.phone && `Phone: ${company.phone}`}</span><span>{company.email && `Email: ${company.email}`}</span><span>{company.website}</span></div></div>{logo ? <img className="invoice-logo" src={logo} alt={`${company.name} logo`} /> : <div className="brand-mark"><span>MOTION</span><b>MIRAGE</b><small>STUDIOS</small></div>}</header>
        <div className="invoice-meta"><div><span>Invoice number</span><strong>{invoiceNumber || "Not set"}</strong></div><div><span>Issue date</span><strong>{formatDate(invoiceDate)}</strong></div><div><span>Due date</span><strong>{formatDate(dueDate)}</strong></div></div>
        <div className="bill-to"><div className="block-label">Billed to</div><strong>{clientName || "Client name"}</strong><span>{clientAddress || "Billing address"}</span><span>{clientEmail || "billing@email.com"}</span>{selectedClient?.gst && <span>GST: {selectedClient.gst}</span>}</div>
        <div className="service-heading"><h3>Description of services</h3><span>{items.length} line{items.length === 1 ? "" : "s"}</span></div><table className="service-table"><thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.description || "Service description"}</td><td>{item.quantity}</td><td>{formatCurrency(item.rate)}</td><td>{formatCurrency(item.quantity * item.rate)}</td></tr>)}</tbody></table>
        <div className="invoice-total"><span>Total due</span><strong>{formatCurrency(subtotal)}</strong></div><div className="invoice-footer"><div><div className="block-label">Payment note</div><p>{notes || "Add payment terms in the editor."}</p></div><div className="thank-you">Thank you<br /><strong>for your business.</strong></div></div>
      </article></section>
    </div>
  );
}
