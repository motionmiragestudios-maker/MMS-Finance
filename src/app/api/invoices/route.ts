import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

function isValidDate(value: unknown) {
  return typeof value === "string" && !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime());
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invoices = await db.invoice.findMany({
    where: { ownerId: session.user.id },
    include: { client: true, items: true },
    orderBy: { invoiceDate: "desc" },
  });
  return NextResponse.json(invoices);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { invoiceNumber, invoiceDate, dueDate, clientId, clientName, clientEmail, clientAddress, notes, items } = body;

    if (!invoiceNumber || !isValidDate(invoiceDate) || !isValidDate(dueDate) || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invoice details and at least one line item are required." }, { status: 400 });
    }

    const cleanItems = items.map((item: { description?: unknown; quantity?: unknown; rate?: unknown }) => ({
      description: typeof item.description === "string" ? item.description.trim() : "",
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      discount: 0,
      tax: 0,
    }));

    if (cleanItems.some((item) => !item.description || !Number.isInteger(item.quantity) || item.quantity < 1 || !Number.isInteger(item.rate) || item.rate < 0)) {
      return NextResponse.json({ error: "Each line must have a description, positive quantity, and valid rate." }, { status: 400 });
    }

    const client = await db.client.findUnique({ where: { id: clientId } });
    if (!client && (!clientName || !clientEmail || !clientAddress)) {
      return NextResponse.json({ error: "A complete client record is required." }, { status: 400 });
    }

    const savedClient = client ?? await db.client.create({
      data: {
        id: `cli-${crypto.randomUUID()}`,
        name: clientName,
        contactPerson: clientName,
        email: clientEmail,
        phone: "",
        billingAddress: clientAddress,
        currency: "INR",
        gst: "",
        paymentTerms: "Net 15",
        notes: "",
      },
    });
    const total = cleanItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);

    const invoice = await db.invoice.create({
      data: {
        id: `inv-${crypto.randomUUID()}`,
        ownerId: session.user.id,
        number: String(invoiceNumber).trim(),
        clientId: savedClient.id,
        invoiceDate: new Date(`${invoiceDate}T00:00:00.000Z`),
        dueDate: new Date(`${dueDate}T00:00:00.000Z`),
        status: "Draft",
        subtotal: total,
        discount: 0,
        tax: 0,
        total,
        paid: 0,
        outstanding: total,
        notes: typeof notes === "string" ? notes.trim() : "",
        items: { create: cleanItems },
      },
      include: { client: true, items: true },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Invoice creation failed", error);
    return NextResponse.json({ error: "Unable to save invoice." }, { status: 500 });
  }
}
