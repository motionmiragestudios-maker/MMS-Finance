import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const invoiceId = typeof body.invoiceId === "string" ? body.invoiceId : "";
    const invoice = await db.invoice.findFirst({ where: { id: invoiceId, ownerId: session.user.id } });
    const amount = Number(body.amount);
    if (!invoice || !Number.isInteger(amount) || amount <= 0 || !body.date || amount > invoice.outstanding) return NextResponse.json({ error: "Choose an invoice, valid amount, date, and do not exceed the outstanding balance." }, { status: 400 });
    const payment = await db.payment.create({ data: {
      id: `pay-${crypto.randomUUID()}`, invoiceId, clientId: invoice.clientId, projectId: typeof body.projectId === "string" && body.projectId ? body.projectId : invoice.projectId,
      amount, date: new Date(`${body.date}T00:00:00.000Z`), method: typeof body.method === "string" ? body.method : "Bank Transfer", reference: typeof body.reference === "string" ? body.reference.trim() : "", notes: typeof body.notes === "string" ? body.notes.trim() : "",
    } });
    const paid = invoice.paid + amount;
    await db.invoice.update({ where: { id: invoice.id }, data: { paid, outstanding: Math.max(invoice.total - paid, 0), status: paid >= invoice.total ? "Paid" : "PartiallyPaid" } });
    return NextResponse.json(payment, { status: 201 });
  } catch { return NextResponse.json({ error: "Unable to record payment." }, { status: 400 }); }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const amount = Number(body.amount);
    if (!body.id || !Number.isInteger(amount) || amount <= 0 || !body.date) return NextResponse.json({ error: "Valid amount and date are required." }, { status: 400 });
    const existing = await db.payment.findUnique({ where: { id: body.id } });
    if (!existing) return NextResponse.json({ error: "Payment not found." }, { status: 404 });
    const payment = await db.$transaction(async (transaction) => {
      const updated = await transaction.payment.update({ where: { id: body.id }, data: { amount, date: new Date(`${body.date}T00:00:00.000Z`), method: typeof body.method === "string" ? body.method : existing.method, reference: typeof body.reference === "string" ? body.reference.trim() : existing.reference } });
      const invoice = await transaction.invoice.findUnique({ where: { id: existing.invoiceId } });
      if (invoice) {
        const paid = invoice.paid - existing.amount + amount;
        await transaction.invoice.update({ where: { id: invoice.id }, data: { paid, outstanding: Math.max(invoice.total - paid, 0), status: paid >= invoice.total ? "Paid" : "PartiallyPaid" } });
      }
      return updated;
    });
    return NextResponse.json(payment);
  } catch { return NextResponse.json({ error: "Unable to update this payment." }, { status: 400 }); }
}