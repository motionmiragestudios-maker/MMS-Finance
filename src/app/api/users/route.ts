import { hash } from "bcryptjs";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { isUserRole, normalizeUserRole } from "@/lib/user-roles";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await db.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(users.map((user) => ({ ...user, role: normalizeUserRole(user.role) })));
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const role = body.role;

    if (!name || !email.includes("@") || password.length < 12 || !isUserRole(role)) {
      return NextResponse.json({ error: "Use a name, valid email, password of at least 12 characters, and select a role." }, { status: 400 });
    }

    const passwordHash = await hash(password, 12);
    const user = await db.user.create({
      data: { name, email, passwordHash, role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("User creation failed", error);
    return NextResponse.json({ error: "Unable to create user. The email may already be in use." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) return NextResponse.json({ error: "User id is required." }, { status: 400 });

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const name = typeof body.name === "string" ? body.name.trim() : existing.name;
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : existing.email;
    const password = typeof body.password === "string" ? body.password : "";
    const role = body.role === undefined ? normalizeUserRole(existing.role) : body.role;
    if (!name || !email.includes("@")) return NextResponse.json({ error: "Enter a name and valid email address." }, { status: 400 });
    if (password && password.length < 12) return NextResponse.json({ error: "New passwords must be at least 12 characters." }, { status: 400 });
    if (!isUserRole(role)) return NextResponse.json({ error: "Choose employee, co-founder, or owner." }, { status: 400 });
    if (existing.role === "owner" && role !== "owner" && await db.user.count({ where: { role: "owner" } }) <= 1) {
      return NextResponse.json({ error: "At least one owner account must remain." }, { status: 400 });
    }

    const user = await db.user.update({
      where: { id },
      data: { name, email, role, ...(password ? { passwordHash: await hash(password, 12), passwordResetTokenHash: null, passwordResetExpiresAt: null, passwordResetSentAt: null } : {}) },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return NextResponse.json(user);
  } catch (error) {
    console.error("User update failed", error);
    return NextResponse.json({ error: "Unable to update this user. The email may already be in use." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) return NextResponse.json({ error: "User id is required." }, { status: 400 });
    if (id === session.user.id) return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });

    const target = await db.user.findUnique({ where: { id }, select: { role: true } });
    if (target?.role === "owner" && await db.user.count({ where: { role: "owner" } }) <= 1) {
      return NextResponse.json({ error: "At least one owner account must remain." }, { status: 400 });
    }

    await db.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("User deletion failed", error);
    return NextResponse.json({ error: "Unable to delete this user. They may have linked invoices." }, { status: 400 });
  }
}
