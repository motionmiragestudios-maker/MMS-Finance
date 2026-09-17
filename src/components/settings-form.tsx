"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { defaultCompanyProfile, workspaceKeys } from "@/lib/workspace";
import type { CompanyProfile } from "@/types/finance";

export function SettingsForm() {
  const [profile, setProfile] = useState<CompanyProfile>(defaultCompanyProfile);
  const [logo, setLogo] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedProfile = localStorage.getItem(workspaceKeys.company);
      setProfile(storedProfile ? { ...defaultCompanyProfile, ...JSON.parse(storedProfile) } : defaultCompanyProfile);
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
    reader.onload = () => { setLogo(String(reader.result)); setMessage("PNG logo ready to save."); };
    reader.readAsDataURL(file);
  }

  function save() {
    localStorage.setItem(workspaceKeys.company, JSON.stringify(profile));
    if (logo) localStorage.setItem(workspaceKeys.logo, logo);
    else localStorage.removeItem(workspaceKeys.logo);
    setMessage("Workspace settings saved.");
  }

  return (
    <div className="settings-grid">
      <section className="settings-panel"><div className="panel-heading"><div><p className="eyebrow">Brand system</p><h2>Company details</h2></div><button className="primary-button" type="button" onClick={save}>Save settings</button></div><div className="form-grid two-columns"><label>Company name<input value={profile.name} onChange={(event) => update("name", event.target.value)} /></label><label>Tagline<input value={profile.tagline} onChange={(event) => update("tagline", event.target.value)} /></label><label className="wide-field">Address<textarea rows={2} value={profile.address} onChange={(event) => update("address", event.target.value)} /></label><label>Phone<input value={profile.phone} onChange={(event) => update("phone", event.target.value)} /></label><label>Email<input type="email" value={profile.email} onChange={(event) => update("email", event.target.value)} /></label><label>Website<input value={profile.website} onChange={(event) => update("website", event.target.value)} /></label><label>GST number<input value={profile.gstNumber ?? ""} onChange={(event) => update("gstNumber", event.target.value)} /></label><label>PAN number<input value={profile.panNumber ?? ""} onChange={(event) => update("panNumber", event.target.value)} /></label><label className="wide-field">Bank details<input value={profile.bankDetails ?? ""} onChange={(event) => update("bankDetails", event.target.value)} /></label><label className="wide-field">Default payment note<textarea rows={2} value={profile.invoiceNotes} onChange={(event) => update("invoiceNotes", event.target.value)} /></label></div>{message && <p className="save-message" role="status">{message}</p>}</section>
      <section className="settings-panel logo-panel"><div><p className="eyebrow">Invoice identity</p><h2>Upload your logo</h2><p className="muted">Use a transparent PNG under 2 MB. It will appear in the top-right of every invoice preview and PDF.</p></div><div className="logo-dropzone">{logo ? <img src={logo} alt="Uploaded company logo" /> : <div className="logo-placeholder">PNG<br /><span>Your logo</span></div>}<label className="upload-button">{logo ? "Replace PNG" : "Choose PNG"}<input type="file" accept="image/png" onChange={handleLogo} /></label>{logo && <button className="text-button" type="button" onClick={() => { setLogo(""); setMessage("Logo removed. Save settings to confirm."); }}>Remove logo</button>}</div></section>
    </div>
  );
}
