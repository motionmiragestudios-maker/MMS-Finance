import { createHash, randomBytes } from "node:crypto";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { sendPasswordSetupEmail } from "@/lib/password-reset-email";
import { NextResponse } from "next/server";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const user = await db.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, passwordResetSentAt: true } });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
  if (user.passwordResetSentAt && Date.now() - user.passwordResetSentAt.getTime() < 60_000) {
    return NextResponse.json({ error: "A setup link was sent recently. Wait one minute before sending another." }, { status: 429 });
  }

  const apiUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  const notificationSettings = await db.notificationSettings.findUnique({ where: { id: "notifications" } });
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.SMTP_FROM;
  const smtpReady = Boolean(notificationSettings?.smtpHost && notificationSettings.smtpFromEmail && (!notificationSettings.smtpUsername || notificationSettings.smtpPasswordEncrypted));
  const resendReady = Boolean(apiKey && !apiKey.startsWith("your-") && from && !from.includes("your-email@"));
  if (!apiUrl || (!smtpReady && !resendReady)) {
    return NextResponse.json({ error: "Email is not configured. Add an SMTP server in Settings or configure the Resend environment fallback." }, { status: 503 });
  }

  let appUrl: URL;
  try {
    appUrl = new URL(apiUrl);
  } catch {
    return NextResponse.json({ error: "The application URL is not configured correctly." }, { status: 503 });
  }
  if (process.env.NODE_ENV === "production" && appUrl.protocol !== "https:") {
    return NextResponse.json({ error: "Password setup links require an HTTPS application URL." }, { status: 503 });
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const now = new Date();
  await db.user.update({
    where: { id },
    data: { passwordResetTokenHash: tokenHash, passwordResetExpiresAt: new Date(now.getTime() + 60 * 60 * 1000), passwordResetSentAt: now },
  });

  const resetUrl = new URL("/reset-password", appUrl);
  resetUrl.hash = token;
  try {
    const sent = await sendPasswordSetupEmail({ to: user.email, name: user.name, resetUrl: resetUrl.toString() });
    if (sent) return NextResponse.json({ sent: true });
  } catch {
    // Avoid exposing mail provider details or reset tokens in logs and responses.
  }

  await db.user.updateMany({
    where: { id, passwordResetTokenHash: tokenHash },
    data: { passwordResetTokenHash: null, passwordResetExpiresAt: null, passwordResetSentAt: null },
  });
  return NextResponse.json({ error: "The reset email could not be delivered. Check the email provider configuration and verified sender." }, { status: 502 });
}