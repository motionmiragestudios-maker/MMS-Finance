import { InvoiceBuilder } from "@/components/invoice-builder";
import { requireAuth } from "@/lib/require-auth";

export default async function CreateInvoicePage() {
  await requireAuth();
  return <InvoiceBuilder />;
}
