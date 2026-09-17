import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await db.vendor.findMany({ orderBy: { createdAt: "asc" } }));
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  if (!name || !email || !phone) return NextResponse.json({ error: "Vendor name, email, and phone are required." }, { status: 400 });
  if (!/^\+91\d{10}$/.test(phone.replace(/\s+/g, ""))) return NextResponse.json({ error: "Phone must use +91 followed by 10 digits." }, { status: 400 });
  const vendor = await db.vendor.create({ data: {
    id: `ven-${crypto.randomUUID()}`, name,
    email, phone: phone.replace(/\s+/g, ""),
    notes: typeof body.notes === "string" ? body.notes.trim() : "",
  } });
  return NextResponse.json(vendor, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { await db.vendor.delete({ where: { id: (await request.json()).id } }); return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ error: "Unable to remove vendor." }, { status: 400 }); }
}