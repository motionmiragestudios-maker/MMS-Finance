"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { formatIndianPhone, normalizeIndianPhoneInput, type WorkspaceClient } from "@/lib/workspace";

type ClientForm = { name: string; email: string; phone: string; billingAddress: string; gst: string; notes: string };
type Props = { client: WorkspaceClient; compact?: boolean; onSaved?: (client: WorkspaceClient) => void };

function clientForm(client: WorkspaceClient): ClientForm {
  return {
    name: client.name,
    email: client.email,
    phone: normalizeIndianPhoneInput(client.phone),
    billingAddress: client.billingAddress,
    gst: client.gst,
    notes: client.notes ?? "",
  };
}

export function ClientEditor({ client, compact = false, onSaved }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => clientForm(client));
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  function startEditing() {
    setForm(clientForm(client));
    setMessage("");
    setOpen(true);
  }

  function update(field: keyof ClientForm, value: string) {
    setForm((current) => ({ ...current, [field]: field === "phone" ? normalizeIndianPhoneInput(value) : value }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const phone = formatIndianPhone(form.phone);
    if (!phone) {
      setMessage("Phone must use +91 followed by 10 digits.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: client.id, ...form, phone }),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error ?? "Unable to update this client.");
        return;
      }
      onSaved?.(result);
      setOpen(false);
      router.refresh();
    } catch {
      setMessage("Unable to update this client. Check the connection and retry.");
    } finally {
      setSaving(false);
    }
  }

  return <>
    <button className={compact ? "text-button client-edit-trigger" : "secondary-button"} type="button" onClick={startEditing}>Edit client</button>
    {open && <div className="confirm-dialog client-edit-overlay" role="dialog" aria-modal="true" aria-labelledby={`edit-client-${client.id}`}>
      <form className="confirm-dialog-card client-edit-dialog" onSubmit={save}>
        <div className="client-edit-heading"><div><p className="eyebrow">Client details</p><h2 id={`edit-client-${client.id}`}>Edit {client.name}</h2></div><button className="remove-button" type="button" aria-label="Close edit client dialog" onClick={() => setOpen(false)}>×</button></div>
        <div className="form-grid two-columns">
          <label>Client name<input required autoFocus value={form.name} onChange={(event) => update("name", event.target.value)} /></label>
          <label>Email<input required type="email" value={form.email} onChange={(event) => update("email", event.target.value)} /></label>
          <label>Phone <span className="field-hint">+91 is added automatically</span><input required type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} placeholder="9876543210" value={form.phone} onChange={(event) => update("phone", event.target.value)} /></label>
          <label>GST number<input value={form.gst} onChange={(event) => update("gst", event.target.value)} /></label>
          <label className="wide-field">Billing address<textarea required rows={2} value={form.billingAddress} onChange={(event) => update("billingAddress", event.target.value)} /></label>
          <label className="wide-field">Client notes<textarea rows={4} placeholder="Preferences, follow-ups, or context for your team" value={form.notes} onChange={(event) => update("notes", event.target.value)} /></label>
        </div>
        {message && <p className="login-error" role="alert">{message}</p>}
        <div className="confirm-dialog-actions"><button className="secondary-button" type="button" onClick={() => setOpen(false)}>Cancel</button><button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button></div>
      </form>
    </div>}
  </>;
}
