import { sendNotificationEmail } from "@/lib/notification-delivery";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

export async function sendPasswordSetupEmail({ to, name, resetUrl }: { to: string; name: string; resetUrl: string }) {
  const safeName = escapeHtml(name);
  await sendNotificationEmail({
    to,
    subject: "Set up your Motion Mirage account password",
    text: `Hello ${name},\n\nThe workspace owner invited you to set your password. This one-time link expires in 60 minutes:\n${resetUrl}\n\nIf you did not expect this email, you can ignore it.`,
    html: `<p>Hello ${safeName},</p><p>The workspace owner invited you to set your password.</p><p><a href="${resetUrl}" rel="noreferrer noopener">Set your password</a></p><p>This one-time link expires in 60 minutes. If you did not expect this email, you can ignore it.</p>`,
  });
  return true;
}