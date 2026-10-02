import { createTransport } from "smtp-mailer";
import { db } from "@/lib/db";
import { decryptIntegrationSecret } from "@/lib/integration-secrets";

export type NotificationEvent = "invoice" | "quotation" | "payment";

export async function sendNotificationEmail({ to, subject, text, html }: { to: string; subject: string; text: string; html: string }) {
  const settings = await db.notificationSettings.findUnique({ where: { id: "notifications" } });
  if (settings?.smtpHost && settings.smtpFromEmail) {
    const password = settings.smtpPasswordEncrypted ? decryptIntegrationSecret(settings.smtpPasswordEncrypted) : "";
    const transporter = createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpSecure,
      auth: settings.smtpUsername ? { user: settings.smtpUsername, pass: password } : undefined,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
    await transporter.sendMail({
      from: { name: settings.smtpFromName || "Motion Mirage Studios", address: settings.smtpFromEmail },
      to,
      subject,
      text,
      html,
    });
    return "smtp" as const;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.SMTP_FROM;
  if (apiKey && !apiKey.startsWith("your-") && from && !from.includes("your-email@")) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, text, html }),
    });
    if (!response.ok) throw new Error("Email provider rejected the message.");
    return "resend" as const;
  }
  throw new Error("Email is not configured.");
}

export async function sendDiscordNotification(event: NotificationEvent, content: string) {
  const settings = await db.notificationSettings.findUnique({ where: { id: "notifications" } });
  if (!settings?.discordWebhookEncrypted) return false;
  const enabled = event === "invoice" ? settings.notifyInvoices : event === "quotation" ? settings.notifyQuotations : settings.notifyPayments;
  if (!enabled) return false;

  const webhookUrl = decryptIntegrationSecret(settings.discordWebhookEncrypted);
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: content.slice(0, 1800), allowed_mentions: { parse: [] } }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("Discord webhook rejected the notification.");
  return true;
}

export async function sendDiscordTest() {
  const settings = await db.notificationSettings.findUnique({ where: { id: "notifications" } });
  if (!settings?.discordWebhookEncrypted) throw new Error("Discord webhook is not configured.");
  const webhookUrl = decryptIntegrationSecret(settings.discordWebhookEncrypted);
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: "Motion Mirage Finance test notification. Discord is connected.", allowed_mentions: { parse: [] } }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("Discord webhook rejected the test message.");
}
