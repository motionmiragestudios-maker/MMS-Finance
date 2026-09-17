import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

function isValidDate(value: unknown) {
  return typeof value === "string" && !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime());
}

async function nextInvoiceNumber() {
  const year = new Date().getUTCFullYear();
  const prefix = `MMS-INV-${year}-`;
  const invoices = await db.invoice.findMany({ where: { number: { startsWith: prefix } }, select: { number: true } });
  const highest = invoices.reduce((max, invoice) => {
    const sequence = Number(invoice.number.slice(prefix.length));
    return Number.isInteger(sequence) ? Math.max(max, sequence) : max;
  }, 0);
  return `${prefix}${String(highest + 1).padStart(3, "0")}`;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (new URL(request.url).searchParams.get("nextNumber") === "1") {
    return NextResponse.json({ invoiceNumber: await nextInvoiceNumber() });
  }

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
    const { invoiceNumber, invoiceDate, dueDate, clientId, clientName, clientEmail, clientPhone, clientAddress, notes, items } = body;
    const savedInvoiceNumber = typeof invoiceNumber === "string" && invoiceNumber.trim() ? invoiceNumber.trim() : await nextInvoiceNumber();

    if (!isValidDate(invoiceDate) || !isValidDate(dueDate) || !Array.isArray(items) || items.length === 0) {
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
    if (!client && (!clientName || !clientEmail || !clientPhone || !clientAddress)) {
      return NextResponse.json({ error: "Client name, email, phone, and billing address are required." }, { status: 400 });
    }
    if (!client && !/^\+91\d{10}$/.test(String(clientPhone).replace(/\s+/g, ""))) return NextResponse.json({ error: "Phone must use +91 followed by 10 digits." }, { status: 400 });

    const savedClient = client ?? await db.client.create({
      data: {
        id: `cli-${crypto.randomUUID()}`,
        name: clientName,
        contactPerson: clientName,
        email: clientEmail,
        phone: String(clientPhone).replace(/\s+/g, ""),
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
        number: savedInvoiceNumber,
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
