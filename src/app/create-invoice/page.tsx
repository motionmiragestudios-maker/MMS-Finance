import { InvoiceBuilder } from "@/components/invoice-builder";
import { requireAuth } from "@/lib/require-auth";
import { redirect } from "next/navigation";
import { canManageRecords } from "@/lib/user-roles";

export default async function CreateInvoicePage({ searchParams }: { searchParams: Promise<{ edit?: string | string[] }> }) {
  const session = await requireAuth();
  const { edit } = await searchParams;
  if (edit && !canManageRecords(session.user.role)) redirect("/invoices");
  return <InvoiceBuilder />;
}
