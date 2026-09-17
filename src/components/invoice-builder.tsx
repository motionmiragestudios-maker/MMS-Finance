"use client";

import { useState } from "react";
import { clients, companyProfile } from "@/lib/mock-data";

type LineItem = {
  id: number;
  description: string;
  quantity: number;
  rate: number;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));

export function InvoiceBuilder() {
  const firstClient = clients[0];
  const [invoiceNumber, setInvoiceNumber] = useState("MMS-INV-2026-004");
  const [invoiceDate, setInvoiceDate] = useState("2026-09-17");
  const [dueDate, setDueDate] = useState("2026-10-02");
  const [clientId, setClientId] = useState(firstClient.id);
  const [clientName, setClientName] = useState(firstClient.name);
  const [clientEmail, setClientEmail] = useState(firstClient.email);
  const [clientAddress, setClientAddress] = useState(firstClient.billingAddress);
  const [notes, setNotes] = useState(companyProfile.invoiceNotes);
  const [saveMessage, setSaveMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [items, setItems] = useState<LineItem[]>([
    { id: 1, description: "Monthly social media content package", quantity: 1, rate: 50000 },
  ]);

  const selectedClient = clients.find((client) => client.id === clientId);
  const subtotal = items.reduce((total, item) => total + item.quantity * item.rate, 0);

  function updateClient(value: string) {
    const nextClient = clients.find((client) => client.id === value);
    if (!nextClient) return;
    setClientId(nextClient.id);
    setClientName(nextClient.name);
    setClientEmail(nextClient.email);
    setClientAddress(nextClient.billingAddress);
  }

  function updateItem(id: number, field: keyof LineItem, value: string) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? { ...item, [field]: field === "description" ? value : Number(value) }
          : item,
      ),
    );
  }

  function addItem() {
    setItems((currentItems) => [
      ...currentItems,
      { id: Date.now(), description: "", quantity: 1, rate: 0 },
    ]);
  }

  function removeItem(id: number) {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }

  async function saveInvoice() {
    setIsSaving(true);
    setSaveMessage("");
    const response = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceNumber, invoiceDate, dueDate, clientId, clientName, clientEmail, clientAddress, notes, items }),
    });
    const result = await response.json();
    setIsSaving(false);
    setSaveMessage(response.ok ? "Invoice saved securely." : result.error ?? "Unable to save invoice.");
  }

  return (
    <div className="invoice-workspace">
      <section className="invoice-editor no-print">
        <div className="editor-heading">
          <div>
            <p className="eyebrow">Invoice studio</p>
            <h1>Create an invoice</h1>
            <p className="muted">Build a polished invoice and export it as a PDF in one click.</p>
          </div>
          <div className="editor-actions"><button className="secondary-button" type="button" onClick={saveInvoice} disabled={isSaving}>{isSaving ? "Saving..." : "Save invoice"}</button><button className="primary-button" type="button" onClick={() => window.print()}>Print / Save PDF</button></div>
        </div>
        {saveMessage && <p className="save-message" role="status">{saveMessage}</p>}

        <div className="editor-section">
          <div className="section-heading"><span>01</span><h2>Invoice details</h2></div>
          <div className="form-grid three-columns">
            <label>Invoice number<input value={invoiceNumber} onChange={(event) => setInvoiceNumber(event.target.value)} /></label>
            <label>Issue date<input type="date" value={invoiceDate} onChange={(event) => setInvoiceDate(event.target.value)} /></label>
            <label>Due date<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label>
          </div>
        </div>

        <div className="editor-section">
          <div className="section-heading"><span>02</span><h2>Bill to</h2></div>
          <div className="form-grid two-columns">
            <label>Saved client<select value={clientId} onChange={(event) => updateClient(event.target.value)}>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
            <label>Client name<input value={clientName} onChange={(event) => setClientName(event.target.value)} /></label>
            <label>Email<input type="email" value={clientEmail} onChange={(event) => setClientEmail(event.target.value)} /></label>
            <label>Billing address<textarea rows={2} value={clientAddress} onChange={(event) => setClientAddress(event.target.value)} /></label>
          </div>
        </div>

        <div className="editor-section">
          <div className="section-heading"><span>03</span><h2>Services</h2><button className="text-button" type="button" onClick={addItem}>+ Add line</button></div>
          <div className="line-editor">
            {items.map((item) => (
              <div className="line-row" key={item.id}>
                <input aria-label="Service description" placeholder="Service description" value={item.description} onChange={(event) => updateItem(item.id, "description", event.target.value)} />
                <input aria-label="Quantity" type="number" min="1" value={item.quantity} onChange={(event) => updateItem(item.id, "quantity", event.target.value)} />
                <input aria-label="Rate" type="number" min="0" value={item.rate} onChange={(event) => updateItem(item.id, "rate", event.target.value)} />
                <button className="remove-button" type="button" aria-label="Remove line" onClick={() => removeItem(item.id)}>×</button>
              </div>
            ))}
            <div className="line-labels"><span>Description</span><span>Qty</span><span>Rate</span></div>
          </div>
        </div>

        <div className="editor-section">
          <div className="section-heading"><span>04</span><h2>Notes</h2></div>
          <label className="full-label">Payment note<textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
        </div>
      </section>

      <section className="invoice-preview-wrap">
        <div className="preview-toolbar no-print"><span>Live preview</span><span>A4 document</span></div>
        <article className="invoice-paper">
          <header className="invoice-header">
            <div>
              <p className="invoice-kicker">Tax invoice</p>
              <h2>INVOICE</h2>
              <div className="company-details"><strong>{companyProfile.name}</strong><span>{companyProfile.tagline}</span><span>{companyProfile.address}</span><span>Phone: {companyProfile.phone}</span><span>Email: {companyProfile.email}</span><span>Website: {companyProfile.website}</span></div>
            </div>
            <div className="brand-mark"><span>MOTION</span><b>MIRAGE</b><small>STUDIOS</small></div>
          </header>

          <div className="invoice-meta"><div><span>Invoice number</span><strong>{invoiceNumber}</strong></div><div><span>Issue date</span><strong>{formatDate(invoiceDate)}</strong></div><div><span>Due date</span><strong>{formatDate(dueDate)}</strong></div></div>
          <div className="bill-to"><div className="block-label">Billed to</div><strong>{clientName}</strong><span>{clientAddress}</span><span>{clientEmail}</span>{selectedClient?.gst && <span>GST: {selectedClient.gst}</span>}</div>

          <div className="service-heading"><h3>Description of services</h3><span>{items.length} line{items.length === 1 ? "" : "s"}</span></div>
          <table className="service-table"><thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.description || "Untitled service"}</td><td>{item.quantity}</td><td>{formatCurrency(item.rate)}</td><td>{formatCurrency(item.quantity * item.rate)}</td></tr>)}</tbody></table>
          <div className="invoice-total"><span>Total due</span><strong>{formatCurrency(subtotal)}</strong></div>
          <div className="invoice-footer"><div><div className="block-label">Payment note</div><p>{notes}</p></div><div className="thank-you">Thank you<br /><strong>for your business.</strong></div></div>
        </article>
      </section>
    </div>
  );
}
