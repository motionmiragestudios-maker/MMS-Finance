import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const clientId = typeof body.clientId === "string" ? body.clientId : "";
    if (!name || !clientId || !body.startDate || !body.deliveryDate) return NextResponse.json({ error: "Quotation title, client, quotation date, and valid-until date are required." }, { status: 400 });
    const project = await db.project.create({ data: {
      id: `prj-${crypto.randomUUID()}`, name, clientId,
      description: typeof body.description === "string" ? body.description.trim() : "",
      startDate: new Date(`${body.startDate}T00:00:00.000Z`), shootDate: new Date(`${body.shootDate ?? body.deliveryDate}T00:00:00.000Z`), deliveryDate: new Date(`${body.deliveryDate}T00:00:00.000Z`),
      quotationAmount: Number(body.quotationAmount) || 0, invoiceAmount: 0, paymentsReceived: 0, projectExpenses: 0,
      status: "QuotationSent", billingStatus: "Draft", notes: typeof body.notes === "string" ? body.notes.trim() : "",
    }, include: { client: true } });
    return NextResponse.json(project, { status: 201 });
  } catch { return NextResponse.json({ error: "Unable to create project." }, { status: 400 }); }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Quotation id is required." }, { status: 400 });

  try {
    await db.$transaction(async (transaction) => {
      const project = await transaction.project.findUnique({ where: { id }, select: { id: true } });
      if (!project) throw new Error("not-found");
      const invoices = await transaction.invoice.findMany({ where: { projectId: id }, select: { id: true } });
      const invoiceIds = invoices.map((invoice) => invoice.id);
      if (invoiceIds.length) {
        await transaction.payment.deleteMany({ where: { invoiceId: { in: invoiceIds } } });
        await transaction.invoiceItem.deleteMany({ where: { invoiceId: { in: invoiceIds } } });
        await transaction.invoice.deleteMany({ where: { id: { in: invoiceIds } } });
      }
      await transaction.payment.deleteMany({ where: { projectId: id } });
      await transaction.expense.deleteMany({ where: { projectId: id } });
      await transaction.project.delete({ where: { id } });
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete this quotation." }, { status: 400 });
  }
}