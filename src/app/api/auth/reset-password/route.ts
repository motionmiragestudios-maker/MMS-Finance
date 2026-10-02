import { createHash } from "node:crypto";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (token.length < 32 || token.length > 100) return NextResponse.json({ error: "This password setup link is invalid or expired." }, { status: 400 });
    if (password.length < 12) return NextResponse.json({ error: "Choose a password of at least 12 characters." }, { status: 400 });

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const user = await db.user.findUnique({ where: { passwordResetTokenHash: tokenHash }, select: { id: true, passwordResetExpiresAt: true } });
    if (!user?.passwordResetExpiresAt || user.passwordResetExpiresAt <= new Date()) {
      return NextResponse.json({ error: "This password setup link is invalid or expired." }, { status: 400 });
    }

    const result = await db.user.updateMany({
      where: { id: user.id, passwordResetTokenHash: tokenHash, passwordResetExpiresAt: { gt: new Date() } },
      data: { passwordHash: await hash(password, 12), passwordResetTokenHash: null, passwordResetExpiresAt: null, passwordResetSentAt: null },
    });
    if (result.count !== 1) return NextResponse.json({ error: "This password setup link is invalid or expired." }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to reset the password. Request a new setup link." }, { status: 400 });
  }
}