import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const invoiceId = typeof body.invoiceId === "string" ? body.invoiceId : "";
    const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });
    const amount = Number(body.amount);
    if (!invoice || !Number.isInteger(amount) || amount <= 0 || !body.date) return NextResponse.json({ error: "Choose an invoice, valid amount, and date." }, { status: 400 });
    const payment = await db.payment.create({ data: {
      id: `pay-${crypto.randomUUID()}`, invoiceId, clientId: invoice.clientId, projectId: typeof body.projectId === "string" && body.projectId ? body.projectId : invoice.projectId,
      amount, date: new Date(`${body.date}T00:00:00.000Z`), method: typeof body.method === "string" ? body.method : "Bank Transfer", reference: typeof body.reference === "string" ? body.reference.trim() : "", notes: typeof body.notes === "string" ? body.notes.trim() : "",
    } });
    const paid = invoice.paid + amount;
    await db.invoice.update({ where: { id: invoice.id }, data: { paid, outstanding: Math.max(invoice.total - paid, 0), status: paid >= invoice.total ? "Paid" : "PartiallyPaid" } });
    return NextResponse.json(payment, { status: 201 });
  } catch { return NextResponse.json({ error: "Unable to record payment." }, { status: 400 }); }
}