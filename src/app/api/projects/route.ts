import { auth } from "@/auth";
import { db } from "@/lib/db";
import { nextQuotationNumber } from "@/lib/quotation-numbers";
import { NextResponse } from "next/server";
import { canManageRecords } from "@/lib/user-roles";
import { sendDiscordNotification } from "@/lib/notification-delivery";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageRecords(session.user.role)) return NextResponse.json({ error: "Your role cannot create quotations." }, { status: 403 });
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const clientId = typeof body.clientId === "string" ? body.clientId : "";
    if (!name || !clientId || !body.startDate || !body.deliveryDate) return NextResponse.json({ error: "Quotation title, client, quotation date, and valid-until date are required." }, { status: 400 });
    const quotationDate = new Date(`${body.startDate}T00:00:00.000Z`);
    if (Number.isNaN(quotationDate.getTime())) return NextResponse.json({ error: "Enter a valid quotation date." }, { status: 400 });
    const quotationNumber = await nextQuotationNumber(quotationDate.getUTCFullYear());
    const project = await db.project.create({ data: {
      id: `prj-${crypto.randomUUID()}`, quotationNumber, name, clientId,
      description: typeof body.description === "string" ? body.description.trim() : "",
      startDate: quotationDate, shootDate: new Date(`${body.shootDate ?? body.deliveryDate}T00:00:00.000Z`), deliveryDate: new Date(`${body.deliveryDate}T00:00:00.000Z`),
      quotationAmount: Number(body.quotationAmount) || 0, invoiceAmount: 0, paymentsReceived: 0, projectExpenses: 0,
      status: "QuotationSent", billingStatus: "Draft", notes: typeof body.notes === "string" ? body.notes.trim() : "",
    }, include: { client: true } });
    await sendDiscordNotification("quotation", `New quotation ${project.quotationNumber} created: ${project.name} for ${project.client.name}.`).catch(() => false);
    return NextResponse.json(project, { status: 201 });
  } catch { return NextResponse.json({ error: "Unable to create project." }, { status: 400 }); }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageRecords(session.user.role)) return NextResponse.json({ error: "Your role cannot delete quotations." }, { status: 403 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Quotation id is required." }, { status: 400 });

  try {
    const { count } = await db.project.deleteMany({ where: { id } });
    if (!count) return NextResponse.json({ error: "Quotation not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Quotation deletion failed", error);
    return NextResponse.json({ error: "Unable to delete this quotation." }, { status: 400 });
  }
}