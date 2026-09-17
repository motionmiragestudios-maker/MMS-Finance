import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { companyProfile, clients, expenses, invoices, payments, projects } from "../src/lib/mock-data";

const prisma = new PrismaClient();

const date = (value: string) => new Date(`${value}T00:00:00.000Z`);
const invoiceStatus = (value: string) => value.replace(" ", "") as never;
const projectStatus = (value: string) => value.replaceAll(" ", "") as never;

async function main() {
  const adminEmail = process.env.AUTH_ADMIN_EMAIL ?? "owner@motionmirage.studio";
  const adminPassword = process.env.AUTH_ADMIN_PASSWORD;
  const adminPasswordHash = process.env.AUTH_ADMIN_PASSWORD_HASH ?? (adminPassword ? await hash(adminPassword, 12) : null);

  if (!adminPasswordHash) {
    throw new Error("Set AUTH_ADMIN_PASSWORD_HASH (or AUTH_ADMIN_PASSWORD for local seeding) before running db:seed.");
  }

  const owner = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: "Studio owner", passwordHash: adminPasswordHash },
    create: { name: "Studio owner", email: adminEmail, passwordHash: adminPasswordHash },
  });

  await prisma.companyProfile.upsert({
    where: { id: "company" },
    update: companyProfile,
    create: { id: "company", ...companyProfile },
  });

  for (const client of clients) {
    await prisma.client.upsert({ where: { id: client.id }, update: client, create: client });
  }

  for (const project of projects) {
    await prisma.project.upsert({
      where: { id: project.id },
      update: {
        ...project,
        startDate: date(project.startDate),
        shootDate: date(project.shootDate),
        deliveryDate: date(project.deliveryDate),
        status: projectStatus(project.status),
        billingStatus: invoiceStatus(project.billingStatus),
      },
      create: {
        ...project,
        startDate: date(project.startDate),
        shootDate: date(project.shootDate),
        deliveryDate: date(project.deliveryDate),
        status: projectStatus(project.status),
        billingStatus: invoiceStatus(project.billingStatus),
      },
    });
  }

  for (const invoice of invoices) {
    await prisma.invoice.upsert({
      where: { id: invoice.id },
      update: {
        ...invoice,
        ownerId: owner.id,
        projectId: invoice.projectId || null,
        invoiceDate: date(invoice.invoiceDate),
        dueDate: date(invoice.dueDate),
        status: invoiceStatus(invoice.status),
        items: { deleteMany: {}, create: invoice.items },
      },
      create: {
        ...invoice,
        ownerId: owner.id,
        projectId: invoice.projectId || null,
        invoiceDate: date(invoice.invoiceDate),
        dueDate: date(invoice.dueDate),
        status: invoiceStatus(invoice.status),
        items: { create: invoice.items },
      },
    });
  }

  for (const payment of payments) {
    await prisma.payment.upsert({
      where: { id: payment.id },
      update: { ...payment, projectId: payment.projectId || null, date: date(payment.date) },
      create: { ...payment, projectId: payment.projectId || null, date: date(payment.date) },
    });
  }

  for (const expense of expenses) {
    await prisma.expense.upsert({
      where: { id: expense.id },
      update: { ...expense, projectId: expense.projectId || null, date: date(expense.date) },
      create: { ...expense, projectId: expense.projectId || null, date: date(expense.date) },
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
