import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await db.client.findMany({ orderBy: { createdAt: "asc" } }));
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const billingAddress = typeof body.billingAddress === "string" ? body.billingAddress.trim() : "";
    if (!name || !email || !billingAddress) return NextResponse.json({ error: "Client name, email, phone, and billing address are required." }, { status: 400 });
    if (!/^\+91\d{10}$/.test(phone.replace(/\s+/g, ""))) return NextResponse.json({ error: "Phone must use +91 followed by 10 digits." }, { status: 400 });
    const client = await db.client.create({ data: {
      id: `cli-${crypto.randomUUID()}`, name, contactPerson: name,
      email, phone: phone.replace(/\s+/g, ""), billingAddress,
      currency: "INR", gst: typeof body.gst === "string" ? body.gst.trim() : "",
      paymentTerms: "Net 15", notes: "", outstandingBalance: 0,
    } });
    return NextResponse.json(client, { status: 201 });
  } catch { return NextResponse.json({ error: "Unable to create client." }, { status: 400 }); }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await request.json();
    const client = await db.client.findUnique({ where: { id }, select: { id: true } });
    if (!client) return NextResponse.json({ error: "Client not found." }, { status: 404 });

    await db.$transaction(async (transaction) => {
      const projects = await transaction.project.findMany({ where: { clientId: id }, select: { id: true } });
      const projectIds = projects.map((project) => project.id);
      const invoices = await transaction.invoice.findMany({ where: { clientId: id }, select: { id: true } });
      const invoiceIds = invoices.map((invoice) => invoice.id);

      if (projectIds.length) {
        await transaction.expense.deleteMany({ where: { projectId: { in: projectIds } } });
        await transaction.payment.deleteMany({ where: { projectId: { in: projectIds } } });
      }
      if (invoiceIds.length) {
        await transaction.payment.deleteMany({ where: { invoiceId: { in: invoiceIds } } });
        await transaction.invoiceItem.deleteMany({ where: { invoiceId: { in: invoiceIds } } });
      }
      await transaction.payment.deleteMany({ where: { clientId: id } });
      await transaction.invoice.deleteMany({ where: { clientId: id } });
      await transaction.project.deleteMany({ where: { clientId: id } });
      await transaction.client.delete({ where: { id } });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Client deletion failed", error);
    return NextResponse.json({ error: "Unable to delete this client and its linked records." }, { status: 400 });
  }
}