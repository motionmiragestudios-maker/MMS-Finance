import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const amount = Number(body.amount);
    if (!body.category || !body.vendor || !Number.isInteger(amount) || amount <= 0 || !body.date) return NextResponse.json({ error: "Category, vendor, date, and a valid amount are required." }, { status: 400 });
    const expense = await db.expense.create({ data: {
      id: `exp-${crypto.randomUUID()}`, category: String(body.category).trim(), vendor: String(body.vendor).trim(), amount, date: new Date(`${body.date}T00:00:00.000Z`), projectId: typeof body.projectId === "string" && body.projectId ? body.projectId : null, method: typeof body.method === "string" ? body.method : "Bank Transfer", reference: typeof body.reference === "string" ? body.reference.trim() : "", notes: typeof body.notes === "string" ? body.notes.trim() : "",
    } });
    return NextResponse.json(expense, { status: 201 });
  } catch { return NextResponse.json({ error: "Unable to add expense." }, { status: 400 }); }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) return NextResponse.json({ error: "Expense id is required." }, { status: 400 });
    await db.expense.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Expense deletion failed", error);
    return NextResponse.json({ error: "Unable to delete this expense." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const amount = Number(body.amount);
    if (!body.id || !body.category || !body.vendor || !Number.isInteger(amount) || amount <= 0 || !body.date) return NextResponse.json({ error: "Category, vendor, date, and a valid amount are required." }, { status: 400 });
    const expense = await db.expense.update({ where: { id: body.id }, data: { category: String(body.category).trim(), vendor: String(body.vendor).trim(), amount, date: new Date(`${body.date}T00:00:00.000Z`), projectId: typeof body.projectId === "string" && body.projectId ? body.projectId : null, method: typeof body.method === "string" ? body.method : "Bank Transfer", reference: typeof body.reference === "string" ? body.reference.trim() : "", notes: typeof body.notes === "string" ? body.notes.trim() : "" } });
    return NextResponse.json(expense);
  } catch { return NextResponse.json({ error: "Unable to update this expense." }, { status: 400 }); }
}