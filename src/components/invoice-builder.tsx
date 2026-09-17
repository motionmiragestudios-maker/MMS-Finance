"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { defaultCompanyProfile, formatIndianPhone, normalizeIndianPhoneInput, workspaceKeys, type WorkspaceClient } from "@/lib/workspace";
import type { CompanyProfile } from "@/types/finance";
import { ToastNotification } from "@/components/toast-notification";
import { InvoicePaymentDetails } from "@/components/invoice-payment-details";

type LineItem = { id: number; description: string; quantity: number; rate: number };

const emptyItem = (): LineItem => ({ id: Date.now(), description: "", quantity: 1, rate: 0 });
const formatCurrency = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
const formatDate = (value: string) => value ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${value}T00:00:00`)) : "Select date";
const addDays = (value: string, days: number) => { const date = new Date(`${value}T00:00:00`); date.setDate(date.getDate() + days); return date.toISOString().slice(0, 10); };

export function InvoiceBuilder() {
  const [company, setCompany] = useState<CompanyProfile>(defaultCompanyProfile);
  const [logo, setLogo] = useState("");
  const [clients, setClients] = useState<WorkspaceClient[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [autoDueDate, setAutoDueDate] = useState(true);
  const [clientId, setClientId] = useState("new");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);
  const [editingInvoiceId, setEditingInvoiceId] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const today = new Date().toISOString().slice(0, 10);
      const editId = new URLSearchParams(window.location.search).get("edit") ?? "";
      setEditingInvoiceId(editId);
      const storedCompany = localStorage.getItem(workspaceKeys.company);
      const storedLogo = localStorage.getItem(workspaceKeys.logo);
      const parsedCompany = storedCompany ? JSON.parse(storedCompany) : defaultCompanyProfile;
      setCompany({ ...defaultCompanyProfile, ...parsedCompany });
      setLogo(storedLogo ?? "");
      const clientsResponse = await fetch("/api/clients");
      if (clientsResponse.ok) setClients(await clientsResponse.json());
      setInvoiceDate(today);
      setDueDate(addDays(today, 27));
      setNotes(parsedCompany.invoiceNotes ?? defaultCompanyProfile.invoiceNotes);
      if (editId) {
        const invoiceResponse = await fetch(`/api/invoices?id=${editId}`);
        if (invoiceResponse.ok) {
          const invoice = await invoiceResponse.json();
          setInvoiceNumber(invoice.number); setInvoiceDate(invoice.invoiceDate.slice(0, 10)); setDueDate(invoice.dueDate.slice(0, 10)); setClientId(invoice.clientId); setClientName(invoice.client.name); setClientEmail(invoice.client.email); setClientPhone(normalizeIndianPhoneInput(invoice.client.phone)); setClientAddress(invoice.client.billingAddress); setNotes(invoice.notes); setItems(invoice.items.map((item: { id: string; description: string; quantity: number; rate: number }) => ({ id: Number(item.id) || Date.now(), description: item.description, quantity: item.quantity, rate: item.rate })));
        }
      } else {
        const numberResponse = await fetch("/api/invoices?nextNumber=1");
        if (numberResponse.ok) setInvoiceNumber((await numberResponse.json()).invoiceNumber);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const refreshLogo = () => setLogo(localStorage.getItem(workspaceKeys.logo) ?? "");
    window.addEventListener("motion-mirage-logo-updated", refreshLogo);
    window.addEventListener("storage", refreshLogo);
    return () => {
      window.removeEventListener("motion-mirage-logo-updated", refreshLogo);
      window.removeEventListener("storage", refreshLogo);
    };
  }, []);

  const subtotal = items.reduce((total, item) => total + item.quantity * item.rate, 0);
  const selectedClient = clients.find((client) => client.id === clientId);

  function updateClient(value: string) {
    setClientId(value);
    const nextClient = clients.find((client) => client.id === value);
    setClientName(nextClient?.name ?? "");
    setClientEmail(nextClient?.email ?? "");
    setClientPhone(normalizeIndianPhoneInput(nextClient?.phone ?? ""));
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
    const response = await fetch("/api/invoices", { method: editingInvoiceId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingInvoiceId || undefined, invoiceNumber, invoiceDate, dueDate, clientId: clientId === "new" ? undefined : clientId, clientName, clientEmail, clientPhone: formatIndianPhone(clientPhone), clientAddress, notes, items }) });
    const result = await response.json();
    setIsSaving(false);
    setSaveMessage(response.ok ? "Invoice saved securely." : result.error ?? "Unable to save invoice.");
    return response.ok;
  }

  async function saveAndPrint() {
    setIsPrinting(true);
    const saved = await saveInvoice();
    if (saved) window.print();
    setIsPrinting(false);
  }

  return (
    <div className="invoice-workspace">
      <section className="invoice-editor no-print">
        <div className="editor-heading">
          <div><p className="eyebrow">Invoice studio</p><h1>Make it official.</h1><p className="muted">Start from a clean canvas. Your saved company details and logo will appear automatically.</p></div>
          <div className="editor-actions"><button className="secondary-button" type="button" onClick={() => void saveInvoice()} disabled={isSaving || isPrinting}>{isSaving ? "Saving..." : "Save invoice"}</button><button className="primary-button" type="button" onClick={() => void saveAndPrint()} disabled={isSaving || isPrinting}>{isPrinting ? "Saving invoice..." : "Save & Print PDF"}</button></div>
        </div>
        {saveMessage && <ToastNotification message={saveMessage} onDismiss={() => setSaveMessage("")} />}

        <div className="editor-section"><div className="section-heading"><span>01</span><h2>Invoice details</h2></div><div className="form-grid three-columns"><label>Invoice number<input placeholder="e.g. MMS-INV-2026-001" value={invoiceNumber} onChange={(event) => setInvoiceNumber(event.target.value)} /></label><label>Issue date<input type="date" value={invoiceDate} onChange={(event) => { const value = event.target.value; setInvoiceDate(value); if (autoDueDate && value) setDueDate(addDays(value, 27)); }} /></label><label>Due date<input type="date" disabled={autoDueDate} value={dueDate} onChange={(event) => setDueDate(event.target.value)} /><span className="date-option"><input type="checkbox" checked={autoDueDate} onChange={(event) => { const checked = event.target.checked; setAutoDueDate(checked); if (checked && invoiceDate) setDueDate(addDays(invoiceDate, 27)); }} /> Auto-calculate 28-day due date</span></label></div></div>

        <div className="editor-section"><div className="section-heading"><span>02</span><h2>Bill to</h2><Link className="text-button" href="/clients">Manage clients</Link></div><div className="form-grid two-columns"><label>Saved client<select value={clientId} onChange={(event) => updateClient(event.target.value)}><option value="new">New client</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label><label>Client name<input placeholder="Client or company name" value={clientName} onChange={(event) => setClientName(event.target.value)} /></label><label>Email<input type="email" placeholder="billing@email.com" value={clientEmail} onChange={(event) => setClientEmail(event.target.value)} /></label><label>Phone <span className="field-hint">+91 is added automatically</span><input required type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} placeholder="9876543210" title="Enter 10 digits; +91 is added automatically" value={clientPhone} onChange={(event) => setClientPhone(normalizeIndianPhoneInput(event.target.value))} /></label><label>Billing address<textarea required rows={2} placeholder="Full billing address" value={clientAddress} onChange={(event) => setClientAddress(event.target.value)} /></label></div></div>

        <div className="editor-section"><div className="section-heading"><span>03</span><h2>Services</h2><button className="text-button" type="button" onClick={addItem}>+ Add line</button></div><div className="line-editor">{items.map((item) => <div className="line-row" key={item.id}><input aria-label="Service description" placeholder="What are you billing for?" value={item.description} onChange={(event) => updateItem(item.id, "description", event.target.value)} /><input aria-label="Quantity" type="number" min="1" value={item.quantity} onChange={(event) => updateItem(item.id, "quantity", event.target.value)} /><input aria-label="Rate" type="number" min="0" placeholder="0" value={item.rate || ""} onChange={(event) => updateItem(item.id, "rate", event.target.value)} /><button className="remove-button" type="button" aria-label="Remove line" onClick={() => removeItem(item.id)}>×</button></div>)}<div className="line-labels"><span>Description</span><span>Qty</span><span>Rate</span></div></div></div>

        <div className="editor-section"><div className="section-heading"><span>04</span><h2>Notes</h2></div><label className="full-label">Payment note<textarea rows={3} placeholder="Add payment terms or a personal note" value={notes} onChange={(event) => setNotes(event.target.value)} /></label></div>
      </section>

      <section className="invoice-preview-wrap"><div className="preview-toolbar no-print"><span>Live preview</span><span>A4 document</span></div><article className="invoice-paper">
        <header className="invoice-header"><div><h2>INVOICE</h2><div className="company-details"><strong>{company.name}</strong><span>{company.tagline}</span><span>{company.address || "Company address"}</span><span>{company.phone && `Phone: ${company.phone}`}</span><span>{company.email && `Email: ${company.email}`}</span><span>{company.website}</span></div></div>{logo ? <img className="invoice-logo" src={logo} alt={`${company.name} logo`} /> : <div className="brand-mark"><span>MOTION</span><b>MIRAGE</b><small>STUDIOS</small></div>}</header>
        <div className="invoice-meta"><div><span>Invoice number</span><strong>{invoiceNumber || "Not set"}</strong></div><div><span>Issue date</span><strong>{formatDate(invoiceDate)}</strong></div><div><span>Due date</span><strong>{formatDate(dueDate)}</strong></div></div>
        <div className="bill-to"><div className="block-label">Billed to</div><strong>{clientName || "Client name"}</strong><span>{clientAddress || "Billing address"}</span><span>{clientEmail || "billing@email.com"}</span>{selectedClient?.gst && <span>GST: {selectedClient.gst}</span>}</div>
        <div className="service-heading"><h3>Description of services</h3><span>{items.length} line{items.length === 1 ? "" : "s"}</span></div><table className="service-table"><thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.description || "Service description"}</td><td>{item.quantity}</td><td>{formatCurrency(item.rate)}</td><td>{formatCurrency(item.quantity * item.rate)}</td></tr>)}</tbody></table>
        <div className="invoice-total"><span>Total due</span><strong>{formatCurrency(subtotal)}</strong></div><div className="invoice-footer"><div><div className="block-label">Payment note</div><p>{notes || "Add payment terms in the editor."}</p></div><InvoicePaymentDetails amount={subtotal} fallbackUpi={company.upiDetails ?? ""} /><div className="thank-you">Thank you<br /><strong>for your business.</strong></div></div>
      </article></section>
    </div>
  );
}
