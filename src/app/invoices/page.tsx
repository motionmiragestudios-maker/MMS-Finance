import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/mock-data";
import { requireAuth } from "@/lib/require-auth";
import { InvoiceTableActions } from "@/components/invoice-table-actions";
import Link from "next/link";

export default async function InvoicesPage() {
  const session = await requireAuth();
  const invoices = await db.invoice.findMany({ where: { ownerId: session.user.id }, include: { client: true }, orderBy: { invoiceDate: "desc" } });
  return (
    <main className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Records</p>
          <h1 className="text-3xl font-bold">Invoices</h1>
        </div>
        <Link href="/" className="primary-button">Create invoice</Link>
      </div>

      <div className="invoice-table-wrap overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="invoice-table min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50 text-sm uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Invoice</th>
              <th className="px-5 py-3">Client</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {invoices.map((invoice) => {
              return (
                <tr key={invoice.id} className="text-sm text-slate-700">
                  <td className="px-5 py-4 font-medium text-slate-900"><Link className="text-button" href={`/invoices/${invoice.id}`}>{invoice.number}</Link></td>
                  <td className="px-5 py-4"><Link className="text-button" href={`/clients/${invoice.client.id}`}>{invoice.client.name}</Link></td>
                  <td className="px-5 py-4">{invoice.invoiceDate.toISOString().slice(0, 10)}</td>
                  <td className="px-5 py-4 font-medium">{formatCurrency(invoice.total)}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-5 py-4"><InvoiceTableActions invoiceId={invoice.id} invoiceNumber={invoice.number} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
