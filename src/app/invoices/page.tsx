import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/mock-data";
import { requireAuth } from "@/lib/require-auth";
import { InvoiceTableActions } from "@/components/invoice-table-actions";
import { InvoicePaymentButton } from "@/components/invoice-payment-button";
import { canManageRecords } from "@/lib/user-roles";
import { SearchableTable, type SearchableTableRow } from "@/components/searchable-table";
import Link from "next/link";

export default async function InvoicesPage() {
  const session = await requireAuth();
  const invoices = await db.invoice.findMany({ include: { client: true }, orderBy: { invoiceDate: "desc" } });
  const canManage = canManageRecords(session.user.role);
  const columns = [
    { key: "invoice", label: "Invoice" }, { key: "client", label: "Client" }, { key: "date", label: "Date" },
    { key: "amount", label: "Amount" }, { key: "status", label: "Status" }, { key: "actions", label: "Actions" },
  ];
  const rows: SearchableTableRow[] = invoices.map((invoice) => {
    const date = invoice.invoiceDate.toISOString().slice(0, 10);
    return {
      id: invoice.id,
      searchText: [invoice.number, invoice.client.name, invoice.client.email, date, invoice.status, invoice.total].join(" "),
      cells: [
        <Link className="text-button" href={`/invoices/${invoice.id}`} key="number">{invoice.number}</Link>,
        <Link className="text-button" href={`/clients/${invoice.client.id}`} key="client">{invoice.client.name}</Link>,
        date,
        formatCurrency(invoice.total),
        <span className="record-status" key="status">{invoice.status}</span>,
        <div className="invoice-row-actions" key="actions"><InvoicePaymentButton invoiceId={invoice.id} invoiceNumber={invoice.number} outstanding={invoice.outstanding} canManage={canManage} /><InvoiceTableActions invoiceId={invoice.id} invoiceNumber={invoice.number} canManage={canManage} /></div>,
      ],
    };
  });
  return (
    <main className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Records</p>
          <h1 className="text-3xl font-bold">Invoices</h1>
        </div>
        <Link href="/" className="primary-button">Create invoice</Link>
      </div>

      <SearchableTable columns={columns} rows={rows} placeholder="Search invoices, clients, or status..." emptyMessage="No invoices recorded yet." />
    </main>
  );
}
