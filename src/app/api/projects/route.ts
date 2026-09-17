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
    if (!name || !clientId || !body.startDate || !body.shootDate || !body.deliveryDate) return NextResponse.json({ error: "Name, client, and all project dates are required." }, { status: 400 });
    const project = await db.project.create({ data: {
      id: `prj-${crypto.randomUUID()}`, name, clientId,
      description: typeof body.description === "string" ? body.description.trim() : "",
      startDate: new Date(`${body.startDate}T00:00:00.000Z`), shootDate: new Date(`${body.shootDate}T00:00:00.000Z`), deliveryDate: new Date(`${body.deliveryDate}T00:00:00.000Z`),
      quotationAmount: Number(body.quotationAmount) || 0, invoiceAmount: 0, paymentsReceived: 0, projectExpenses: 0,
      status: "Enquiry", billingStatus: "Draft", notes: typeof body.notes === "string" ? body.notes.trim() : "",
    }, include: { client: true } });
    return NextResponse.json(project, { status: 201 });
  } catch { return NextResponse.json({ error: "Unable to create project." }, { status: 400 }); }
}