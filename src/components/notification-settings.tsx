"use client";

import { useEffect, useState } from "react";

type Settings = {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUsername: string;
  smtpFromEmail: string;
  smtpFromName: string;
  smtpPasswordSet: boolean;
  discordWebhookSet: boolean;
  notifyInvoices: boolean;
  notifyQuotations: boolean;
  notifyPayments: boolean;
};

const defaults: Settings = {
  smtpHost: "", smtpPort: 587, smtpSecure: false, smtpUsername: "", smtpFromEmail: "", smtpFromName: "Motion Mirage Studios",
  smtpPasswordSet: false, discordWebhookSet: false, notifyInvoices: true, notifyQuotations: true, notifyPayments: true,
};

export function NotificationSettings() {
  const [settings, setSettings] = useState(defaults);
  const [smtpPassword, setSmtpPassword] = useState("");
  const [discordWebhook, setDiscordWebhook] = useState("");
  const [clearSmtpPassword, setClearSmtpPassword] = useState(false);
  const [clearDiscordWebhook, setClearDiscordWebhook] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<"email" | "discord" | "">("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    void fetch("/api/notifications/settings").then(async (response) => {
      if (!response.ok) throw new Error("Unable to load notification settings.");
      const result = await response.json();
      if (active) setSettings({ ...defaults, ...result });
    }).catch(() => {
      if (active) setMessage("Unable to load notification settings.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  function update(field: keyof Settings, value: string | number | boolean) {
    setSettings((current) => ({ ...current, [field]: value }));
  }

  async function save() {
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/notifications/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...settings, smtpPassword, discordWebhook, clearSmtpPassword, clearDiscordWebhook }),
    });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) {
      setMessage(result.error ?? "Unable to save notification settings.");
      return;
    }
    setSettings({ ...defaults, ...result });
    setSmtpPassword("");
    setDiscordWebhook("");
    setClearSmtpPassword(false);
    setClearDiscordWebhook(false);
    setMessage("Notification settings saved.");
  }

  async function test(channel: "email" | "discord") {
    setTesting(channel);
    setMessage("");
    const response = await fetch("/api/notifications/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ channel }) });
    const result = await response.json();
    setTesting("");
    setMessage(result.message ?? result.error ?? "Notification test failed.");
  }

  const emailConfigured = Boolean(settings.smtpHost && settings.smtpFromEmail && (!settings.smtpUsername || settings.smtpPasswordSet || smtpPassword));
  const discordConfigured = settings.discordWebhookSet || Boolean(discordWebhook);

  return <section className="settings-panel notification-settings">
    <div className="panel-heading"><div><p className="eyebrow">Delivery & alerts</p><h2>Notifications</h2><p className="muted">Configure account setup emails and operational alerts for your team.</p></div><button className="primary-button" type="button" onClick={() => void save()} disabled={loading || saving}>{saving ? "Saving..." : "Save notification settings"}</button></div>
    {message && <p className="notification-message" role="status">{message}</p>}
    <div className="notification-grid">
      <section className="notification-channel"><div className="notification-channel-heading"><div><p className="eyebrow">Email delivery</p><h3>SMTP server</h3></div><span className={`integration-status ${emailConfigured ? "is-configured" : ""}`}>{emailConfigured ? "Configured" : "Not configured"}</span></div>
        <div className="form-grid two-columns"><label>SMTP host<input autoComplete="url" placeholder="smtp.example.com" value={settings.smtpHost} onChange={(event) => update("smtpHost", event.target.value)} /></label><label>Port<input inputMode="numeric" type="number" min="1" max="65535" value={settings.smtpPort} onChange={(event) => update("smtpPort", Number(event.target.value))} /></label><label>Username<input autoComplete="username" value={settings.smtpUsername} onChange={(event) => update("smtpUsername", event.target.value)} /></label><label>Sender email<input type="email" autoComplete="email" placeholder="finance@yourdomain.com" value={settings.smtpFromEmail} onChange={(event) => update("smtpFromEmail", event.target.value)} /></label><label className="wide-field">Sender name<input value={settings.smtpFromName} onChange={(event) => update("smtpFromName", event.target.value)} /></label><label className="wide-field">SMTP password<input type="password" autoComplete="new-password" placeholder={settings.smtpPasswordSet ? "Saved securely; enter a new value to replace" : "Enter SMTP password or app password"} value={smtpPassword} onChange={(event) => { setSmtpPassword(event.target.value); setClearSmtpPassword(false); }} /></label></div>
        <label className="notification-check"><input type="checkbox" checked={settings.smtpSecure} onChange={(event) => update("smtpSecure", event.target.checked)} />Use implicit SSL/TLS (usually port 465)</label>
        {settings.smtpPasswordSet && <button className="text-button notification-clear" type="button" onClick={() => { setClearSmtpPassword((current) => !current); setSmtpPassword(""); }}>{clearSmtpPassword ? "Keep saved password" : "Clear saved password"}</button>}
        <div className="notification-actions"><button className="secondary-button" type="button" disabled={!emailConfigured || loading || Boolean(testing)} onClick={() => void test("email")}>{testing === "email" ? "Sending test..." : "Test email"}</button></div>
        <p className="field-hint">Password setup links go to the user’s account email. Credentials are encrypted in the database and never shown again.</p>
      </section>
      <section className="notification-channel"><div className="notification-channel-heading"><div><p className="eyebrow">Team activity</p><h3>Discord webhook</h3></div><span className={`integration-status ${discordConfigured ? "is-configured" : ""}`}>{discordConfigured ? "Configured" : "Not configured"}</span></div>
        <label>Webhook URL<input type="password" autoComplete="new-password" placeholder={settings.discordWebhookSet ? "Saved securely; enter a new webhook to replace" : "https://discord.com/api/webhooks/..."} value={discordWebhook} onChange={(event) => { setDiscordWebhook(event.target.value); setClearDiscordWebhook(false); }} /></label>
        {settings.discordWebhookSet && <button className="text-button notification-clear" type="button" onClick={() => { setClearDiscordWebhook((current) => !current); setDiscordWebhook(""); }}>{clearDiscordWebhook ? "Keep saved webhook" : "Clear saved webhook"}</button>}
        <div className="notification-event-list"><span className="block-label">Send alerts for</span><label className="notification-check"><input type="checkbox" checked={settings.notifyInvoices} onChange={(event) => update("notifyInvoices", event.target.checked)} />New invoices</label><label className="notification-check"><input type="checkbox" checked={settings.notifyQuotations} onChange={(event) => update("notifyQuotations", event.target.checked)} />New quotations</label><label className="notification-check"><input type="checkbox" checked={settings.notifyPayments} onChange={(event) => update("notifyPayments", event.target.checked)} />Payments recorded</label></div>
        <div className="notification-actions"><button className="secondary-button" type="button" disabled={!discordConfigured || loading || Boolean(testing)} onClick={() => void test("discord")}>{testing === "discord" ? "Sending test..." : "Test Discord"}</button></div>
        <p className="field-hint">Only the selected event details are posted. Discord mentions are disabled in these messages.</p>
      </section>
    </div>
  </section>;
}
