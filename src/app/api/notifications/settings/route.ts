import { auth } from "@/auth";
import { db } from "@/lib/db";
import { encryptIntegrationSecret } from "@/lib/integration-secrets";
import { NextResponse } from "next/server";

function publicSettings(settings: Awaited<ReturnType<typeof db.notificationSettings.findUnique>>) {
  return {
    smtpHost: settings?.smtpHost ?? "",
    smtpPort: settings?.smtpPort ?? 587,
    smtpSecure: settings?.smtpSecure ?? false,
    smtpUsername: settings?.smtpUsername ?? "",
    smtpFromEmail: settings?.smtpFromEmail ?? "",
    smtpFromName: settings?.smtpFromName ?? "Motion Mirage Studios",
    smtpPasswordSet: Boolean(settings?.smtpPasswordEncrypted),
    discordWebhookSet: Boolean(settings?.discordWebhookEncrypted),
    notifyInvoices: settings?.notifyInvoices ?? true,
    notifyQuotations: settings?.notifyQuotations ?? true,
    notifyPayments: settings?.notifyPayments ?? true,
  };
}

function validDiscordWebhook(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ["discord.com", "discordapp.com"].includes(url.hostname) && /^\/api\/webhooks\/\d+\/[A-Za-z0-9._-]+\/?$/.test(url.pathname);
  } catch {
    return false;
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "owner") return NextResponse.json({ error: "Only the owner can view notification settings." }, { status: 403 });
  const settings = await db.notificationSettings.findUnique({ where: { id: "notifications" } });
  return NextResponse.json(publicSettings(settings));
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "owner") return NextResponse.json({ error: "Only the owner can update notification settings." }, { status: 403 });

  try {
    const body = await request.json();
    const existing = await db.notificationSettings.findUnique({ where: { id: "notifications" } });
    const smtpHost = typeof body.smtpHost === "string" ? body.smtpHost.trim() : "";
    const smtpPort = Number(body.smtpPort);
    const smtpUsername = typeof body.smtpUsername === "string" ? body.smtpUsername.trim() : "";
    const smtpFromEmail = typeof body.smtpFromEmail === "string" ? body.smtpFromEmail.trim() : "";
    const smtpFromName = typeof body.smtpFromName === "string" ? body.smtpFromName.trim() : "";
    const smtpPassword = typeof body.smtpPassword === "string" ? body.smtpPassword : "";
    const webhook = typeof body.discordWebhook === "string" ? body.discordWebhook.trim() : "";

    if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) return NextResponse.json({ error: "SMTP port must be between 1 and 65535." }, { status: 400 });
    if (smtpHost && !/^[A-Za-z0-9.-]+$/.test(smtpHost)) return NextResponse.json({ error: "Enter a valid SMTP server hostname." }, { status: 400 });
    if (smtpFromEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(smtpFromEmail)) return NextResponse.json({ error: "Enter a valid sender email address." }, { status: 400 });
    if (smtpHost && !smtpFromEmail) return NextResponse.json({ error: "Sender email is required when SMTP is enabled." }, { status: 400 });
    if (smtpPassword.length > 1024) return NextResponse.json({ error: "SMTP password is too long." }, { status: 400 });
    if (smtpHost && smtpUsername && !smtpPassword && !existing?.smtpPasswordEncrypted) return NextResponse.json({ error: "Enter the SMTP password for this username." }, { status: 400 });
    if (smtpHost && smtpUsername && body.clearSmtpPassword === true) return NextResponse.json({ error: "Clear the SMTP username too, or keep its password saved." }, { status: 400 });
    if (webhook && !validDiscordWebhook(webhook)) return NextResponse.json({ error: "Use a valid HTTPS Discord webhook URL." }, { status: 400 });

    const smtpPasswordEncrypted = body.clearSmtpPassword
      ? null
      : smtpPassword
        ? encryptIntegrationSecret(smtpPassword)
        : existing?.smtpPasswordEncrypted ?? null;
    const discordWebhookEncrypted = body.clearDiscordWebhook
      ? null
      : webhook
        ? encryptIntegrationSecret(webhook)
        : existing?.discordWebhookEncrypted ?? null;

    const settings = await db.notificationSettings.upsert({
      where: { id: "notifications" },
      create: {
        id: "notifications", smtpHost: smtpHost || null, smtpPort, smtpSecure: body.smtpSecure === true,
        smtpUsername: smtpUsername || null, smtpPasswordEncrypted, smtpFromEmail: smtpFromEmail || null, smtpFromName: smtpFromName || null,
        discordWebhookEncrypted, notifyInvoices: body.notifyInvoices !== false, notifyQuotations: body.notifyQuotations !== false, notifyPayments: body.notifyPayments !== false,
      },
      update: {
        smtpHost: smtpHost || null, smtpPort, smtpSecure: body.smtpSecure === true,
        smtpUsername: smtpUsername || null, smtpPasswordEncrypted, smtpFromEmail: smtpFromEmail || null, smtpFromName: smtpFromName || null,
        discordWebhookEncrypted, notifyInvoices: body.notifyInvoices !== false, notifyQuotations: body.notifyQuotations !== false, notifyPayments: body.notifyPayments !== false,
      },
    });
    return NextResponse.json(publicSettings(settings));
  } catch {
    return NextResponse.json({ error: "Unable to save notification settings securely." }, { status: 400 });
  }
}