import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

type ProjectReader = Pick<Prisma.TransactionClient, "project">;

async function findNextQuotationNumber(client: ProjectReader, year: number) {
  const prefix = `MMS-QUO-${year}-`;
  const quotations = await client.project.findMany({
    where: { quotationNumber: { startsWith: prefix } },
    select: { quotationNumber: true },
  });
  const highest = quotations.reduce((max, quotation) => {
    const sequence = Number(quotation.quotationNumber?.slice(prefix.length));
    return Number.isInteger(sequence) ? Math.max(max, sequence) : max;
  }, 0);
  return `${prefix}${String(highest + 1).padStart(3, "0")}`;
}

export function nextQuotationNumber(year: number) {
  return findNextQuotationNumber(db, year);
}

export async function assignQuotationNumber(projectId: string) {
  return db.$transaction(async (transaction) => {
    const project = await transaction.project.findUnique({
      where: { id: projectId },
      select: { quotationNumber: true, startDate: true },
    });
    if (!project) return null;
    if (project.quotationNumber) return project.quotationNumber;

    const number = await findNextQuotationNumber(transaction, project.startDate.getUTCFullYear());
    const updated = await transaction.project.update({
      where: { id: projectId },
      data: { quotationNumber: number },
      select: { quotationNumber: true },
    });
    return updated.quotationNumber;
  });
}