import { auth } from "@/auth";
import { sendDiscordTest, sendNotificationEmail } from "@/lib/notification-delivery";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "owner") return NextResponse.json({ error: "Only the owner can test notification settings." }, { status: 403 });

  try {
    const body = await request.json();
    if (body.channel === "discord") {
      await sendDiscordTest();
      return NextResponse.json({ ok: true, message: "Test notification sent to Discord." });
    }
    if (body.channel === "email") {
      if (!session.user.email) return NextResponse.json({ error: "Your account does not have an email address." }, { status: 400 });
      await sendNotificationEmail({
        to: session.user.email,
        subject: "Motion Mirage Finance email test",
        text: "Your mail server is connected to Motion Mirage Finance.",
        html: "<p>Your mail server is connected to Motion Mirage Finance.</p>",
      });
      return NextResponse.json({ ok: true, message: `Test email sent to ${session.user.email}.` });
    }
    return NextResponse.json({ error: "Choose email or Discord for the test." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Test failed. Check the server, credentials, sender, or webhook and try again." }, { status: 502 });
  }
}