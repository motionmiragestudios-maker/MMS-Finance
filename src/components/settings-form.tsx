"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { clearBrandingSession, defaultCompanyProfile, formatIndianPhone, normalizeIndianPhoneInput, readSessionValue, workspaceKeys } from "@/lib/workspace";
import type { CompanyProfile } from "@/types/finance";
import { ToastNotification } from "@/components/toast-notification";

export function SettingsForm() {
  const [profile, setProfile] = useState<CompanyProfile>(defaultCompanyProfile);
  const [logo, setLogo] = useState("");
  const [favicon, setFavicon] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const storedProfile = localStorage.getItem(workspaceKeys.company);
      const response = await fetch("/api/company-profile");
      const shared = response.ok ? await response.json() : null;
      let legacyProfile: CompanyProfile | null = null;
      try {
        legacyProfile = storedProfile ? { ...defaultCompanyProfile, ...JSON.parse(storedProfile) } : null;
      } catch {
        localStorage.removeItem(workspaceKeys.company);
      }
      if (legacyProfile && shared && !shared.legacySettingsMigrated) {
        const legacyLogo = readSessionValue(workspaceKeys.logo);
        const legacyFavicon = readSessionValue(workspaceKeys.favicon);
        setProfile({ ...legacyProfile, phone: normalizeIndianPhoneInput(legacyProfile.phone) });
        setLogo(legacyLogo);
        setFavicon(legacyFavicon);
        const migration = await fetch("/api/company-profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile: { ...legacyProfile, phone: formatIndianPhone(legacyProfile.phone) || "" }, logoData: legacyLogo, faviconData: legacyFavicon }) });
        if (migration.ok) {
          localStorage.removeItem(workspaceKeys.company);
          clearBrandingSession();
          window.dispatchEvent(new Event("motion-mirage-logo-updated"));
          setMessage("Your existing company profile is now shared with employee accounts.");
        }
        return;
      }
      if (shared?.legacySettingsMigrated) localStorage.removeItem(workspaceKeys.company);
      const stored = shared ? { ...defaultCompanyProfile, ...shared.profile } : legacyProfile ?? defaultCompanyProfile;
      setProfile({ ...stored, phone: normalizeIndianPhoneInput(stored.phone) });
      setLogo(shared?.logoData ?? readSessionValue(workspaceKeys.logo));
      setFavicon(shared?.faviconData ?? readSessionValue(workspaceKeys.favicon));
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
      setMessage("Main logo selected. Save all settings to share it with employees.");
    };
    reader.readAsDataURL(file);
  }

  function handleFavicon(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "image/png") {
      setMessage("Please choose a PNG favicon.");
      return;
    }
    if (file.size > 512 * 1024) {
      setMessage("Favicon must be smaller than 512 KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const nextFavicon = String(reader.result);
      setFavicon(nextFavicon);
      setMessage("Favicon selected. Save all settings to share it with employees.");
    };
    reader.readAsDataURL(file);
  }

  async function save() {
    const normalizedPhone = formatIndianPhone(profile.phone);
    if (profile.phone && !normalizedPhone) {
      setMessage("Phone must use +91 followed by 10 digits.");
      return;
    }
    const nextProfile = { ...profile, phone: normalizedPhone };
    const response = await fetch("/api/company-profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile: nextProfile, logoData: logo, faviconData: favicon }) });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error ?? "Unable to save shared company details.");
      return;
    }
    localStorage.removeItem(workspaceKeys.company);
    clearBrandingSession();
    window.dispatchEvent(new Event("motion-mirage-logo-updated"));
    setMessage("Workspace settings saved for all employees.");
  }

  return (
    <div className="settings-grid">
      {message && <ToastNotification message={message} onDismiss={() => setMessage("")} />}
      <div className="settings-payment-stack">
        <section className="settings-panel bank-settings-panel"><p className="eyebrow">Bank payment details</p><h2>Payment account</h2><div className="bank-settings-content"><div className="form-grid two-columns"><label>Account name<input value={profile.bankAccountName ?? ""} onChange={(event) => update("bankAccountName", event.target.value)} /></label><label>Bank name<input value={profile.bankName ?? ""} onChange={(event) => update("bankName", event.target.value)} /></label><label>Account number<input inputMode="numeric" value={profile.bankAccountNumber ?? ""} onChange={(event) => update("bankAccountNumber", event.target.value.replace(/\D/g, ""))} /></label><label>Branch<input value={profile.bankBranch ?? ""} onChange={(event) => update("bankBranch", event.target.value)} /></label><label>IFSC code<input value={profile.bankIfsc ?? ""} onChange={(event) => update("bankIfsc", event.target.value.toUpperCase())} /></label></div><div className="bank-account-preview"><span className="block-label">Invoice payment block</span><strong>{profile.bankAccountName || "Account name"}</strong><span>{profile.bankName || "Bank name"}</span><span>{profile.bankAccountNumber ? `A/C ${profile.bankAccountNumber}` : "Account number"}</span><span>{profile.bankBranch || "Branch"}</span><span>{profile.bankIfsc || "IFSC code"}</span></div></div></section>
        <section className="settings-panel upi-settings-panel"><p className="eyebrow">Payment identity</p><h2>UPI payment address</h2><p className="muted">This ID is used to generate a QR code for the exact invoice total.</p><label>UPI ID<input placeholder="yourname@upi" value={profile.upiDetails ?? ""} onChange={(event) => update("upiDetails", event.target.value)} /></label></section>
      </div>
      <section className="settings-panel company-settings-panel"><div className="panel-heading"><div><p className="eyebrow">Brand system</p><h2>Company details</h2></div><button className="primary-button" type="button" onClick={save}>Save all settings</button></div><div className="form-grid two-columns"><label>Company name<input value={profile.name} onChange={(event) => update("name", event.target.value)} /></label><label>Tagline<input value={profile.tagline} onChange={(event) => update("tagline", event.target.value)} /></label><label className="wide-field">Address<textarea rows={2} value={profile.address} onChange={(event) => update("address", event.target.value)} /></label><label>Phone <span className="field-hint">+91 is added automatically</span><input type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} placeholder="9876543210" title="Enter 10 digits; +91 is added automatically" value={normalizeIndianPhoneInput(profile.phone)} onChange={(event) => update("phone", normalizeIndianPhoneInput(event.target.value))} /></label><label>Email<input type="email" value={profile.email} onChange={(event) => update("email", event.target.value)} /></label><label>Website<input value={profile.website} onChange={(event) => update("website", event.target.value)} /></label><label>GST number<input value={profile.gstNumber ?? ""} onChange={(event) => update("gstNumber", event.target.value)} /></label><label>PAN number<input value={profile.panNumber ?? ""} onChange={(event) => update("panNumber", event.target.value)} /></label><label className="wide-field">Bank details<input value={profile.bankDetails ?? ""} onChange={(event) => update("bankDetails", event.target.value)} /></label><label className="wide-field">Default invoice payment note <span className="field-hint">This appears in the Notes section of every new invoice.</span><textarea rows={3} value={profile.invoiceNotes} onChange={(event) => update("invoiceNotes", event.target.value)} /></label></div>{message && <p className="save-message" role="status">{message}</p>}<div className="settings-actions"><button className="primary-button" type="button" onClick={save}>Save all settings</button></div></section>
      <section className="settings-panel logo-panel"><div><p className="eyebrow">Brand identity</p><h2>Main logo and favicon</h2><p className="muted">Upload a main logo for the app layout and invoices, and a separate small favicon for the browser tab.</p></div><div className="logo-dropzone"><div className="logo-uploader"><strong>Main logo</strong>{logo ? <img src={logo} alt="Uploaded company logo" /> : <div className="logo-placeholder">PNG<br /><span>Your logo</span></div>}<label className="upload-button">{logo ? "Replace logo" : "Choose main logo"}<input type="file" accept="image/png" onChange={handleLogo} /></label>{logo && <button className="text-button" type="button" onClick={() => { setLogo(""); setMessage("Main logo will be removed when settings are saved."); }}>Remove</button>}</div><div className="logo-uploader logo-uploader--small"><strong>Favicon</strong>{favicon ? <img src={favicon} alt="Uploaded favicon" className="favicon-preview" /> : <div className="favicon-placeholder">M</div>}<label className="upload-button">{favicon ? "Replace favicon" : "Choose favicon"}<input type="file" accept="image/png" onChange={handleFavicon} /></label>{favicon && <button className="text-button" type="button" onClick={() => { setFavicon(""); setMessage("Favicon will be removed when settings are saved."); }}>Remove</button>}</div></div></section>
    </div>
  );
}
