"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { defaultCompanyProfile, formatIndianPhone, normalizeIndianPhoneInput, workspaceKeys } from "@/lib/workspace";
import type { CompanyProfile } from "@/types/finance";
import { ToastNotification } from "@/components/toast-notification";

export function SettingsForm() {
  const [profile, setProfile] = useState<CompanyProfile>(defaultCompanyProfile);
  const [logo, setLogo] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedProfile = localStorage.getItem(workspaceKeys.company);
      const stored = storedProfile ? { ...defaultCompanyProfile, ...JSON.parse(storedProfile) } : defaultCompanyProfile;
      setProfile({ ...stored, phone: normalizeIndianPhoneInput(stored.phone) });
      setLogo(localStorage.getItem(workspaceKeys.logo) ?? "");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function update(field: keyof CompanyProfile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function handleLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "image/png") {
      setMessage("Please choose a PNG logo.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage("Logo must be smaller than 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const nextLogo = String(reader.result);
      setLogo(nextLogo);
      localStorage.setItem(workspaceKeys.logo, nextLogo);
      window.dispatchEvent(new Event("motion-mirage-logo-updated"));
      setMessage("Logo updated. It will appear in the top-right of your invoice.");
    };
    reader.readAsDataURL(file);
  }

  function save() {
    const normalizedPhone = formatIndianPhone(profile.phone);
    if (profile.phone && !normalizedPhone) {
      setMessage("Phone must use +91 followed by 10 digits.");
      return;
    }
    const nextProfile = { ...profile, phone: normalizedPhone };
    localStorage.setItem(workspaceKeys.company, JSON.stringify(nextProfile));
    if (logo) localStorage.setItem(workspaceKeys.logo, logo);
    else localStorage.removeItem(workspaceKeys.logo);
    window.dispatchEvent(new Event("motion-mirage-logo-updated"));
    setMessage("Workspace settings saved.");
  }

  return (
    <div className="settings-grid">
      {message && <ToastNotification message={message} onDismiss={() => setMessage("")} />}
      <section className="settings-panel upi-settings-panel"><p className="eyebrow">Payment identity</p><h2>UPI payment address</h2><p className="muted">This ID is used to generate a QR code for the exact invoice total.</p><label>UPI ID<input placeholder="yourname@upi" value={profile.upiDetails ?? ""} onChange={(event) => update("upiDetails", event.target.value)} /></label></section>
      <section className="settings-panel bank-settings-panel"><p className="eyebrow">Bank payment details</p><h2>Payment account</h2><div className="form-grid two-columns"><label>Account name<input value={profile.bankAccountName ?? ""} onChange={(event) => update("bankAccountName", event.target.value)} /></label><label>Bank name<input value={profile.bankName ?? ""} onChange={(event) => update("bankName", event.target.value)} /></label><label>Account number<input inputMode="numeric" value={profile.bankAccountNumber ?? ""} onChange={(event) => update("bankAccountNumber", event.target.value.replace(/\D/g, ""))} /></label><label>Branch<input value={profile.bankBranch ?? ""} onChange={(event) => update("bankBranch", event.target.value)} /></label><label>IFSC code<input value={profile.bankIfsc ?? ""} onChange={(event) => update("bankIfsc", event.target.value.toUpperCase())} /></label></div></section>
      <section className="settings-panel"><div className="panel-heading"><div><p className="eyebrow">Brand system</p><h2>Company details</h2></div><button className="primary-button" type="button" onClick={save}>Save all settings</button></div><div className="form-grid two-columns"><label>Company name<input value={profile.name} onChange={(event) => update("name", event.target.value)} /></label><label>Tagline<input value={profile.tagline} onChange={(event) => update("tagline", event.target.value)} /></label><label className="wide-field">Address<textarea rows={2} value={profile.address} onChange={(event) => update("address", event.target.value)} /></label><label>Phone <span className="field-hint">+91 is added automatically</span><input type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} placeholder="9876543210" title="Enter 10 digits; +91 is added automatically" value={normalizeIndianPhoneInput(profile.phone)} onChange={(event) => update("phone", normalizeIndianPhoneInput(event.target.value))} /></label><label>Email<input type="email" value={profile.email} onChange={(event) => update("email", event.target.value)} /></label><label>Website<input value={profile.website} onChange={(event) => update("website", event.target.value)} /></label><label>GST number<input value={profile.gstNumber ?? ""} onChange={(event) => update("gstNumber", event.target.value)} /></label><label>PAN number<input value={profile.panNumber ?? ""} onChange={(event) => update("panNumber", event.target.value)} /></label><label className="wide-field">Bank details<input value={profile.bankDetails ?? ""} onChange={(event) => update("bankDetails", event.target.value)} /></label><label className="wide-field">Default invoice payment note <span className="field-hint">This appears in the Notes section of every new invoice.</span><textarea rows={3} value={profile.invoiceNotes} onChange={(event) => update("invoiceNotes", event.target.value)} /></label></div>{message && <p className="save-message" role="status">{message}</p>}<div className="settings-actions"><button className="primary-button" type="button" onClick={save}>Save all settings</button></div></section>
      <section className="settings-panel logo-panel"><div><p className="eyebrow">Invoice identity</p><h2>Upload your logo</h2><p className="muted">Use a transparent PNG under 2 MB. It appears in the top-right of every invoice preview and PDF.</p></div><div className="logo-dropzone">{logo ? <img src={logo} alt="Uploaded company logo" /> : <div className="logo-placeholder">PNG<br /><span>Your logo</span></div>}<label className="upload-button">{logo ? "Replace PNG" : "Choose PNG"}<input type="file" accept="image/png" onChange={handleLogo} /></label>{logo && <button className="text-button" type="button" onClick={() => { setLogo(""); localStorage.removeItem(workspaceKeys.logo); window.dispatchEvent(new Event("motion-mirage-logo-updated")); setMessage("Logo removed from invoice preview."); }}>Remove logo</button>}</div></section>
    </div>
  );
}
