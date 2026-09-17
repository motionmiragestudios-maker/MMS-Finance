import { clients, formatCurrency, invoices } from "@/lib/mock-data";

export default function InvoicesPage() {
  return (
    <main className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Records</p>
          <h1 className="text-3xl font-bold">Invoices</h1>
        </div>
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Create invoice</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50 text-sm uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Invoice</th>
              <th className="px-5 py-3">Client</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {invoices.map((invoice) => {
              const client = clients.find((item) => item.id === invoice.clientId);
              return (
                <tr key={invoice.id} className="text-sm text-slate-700">
                  <td className="px-5 py-4 font-medium text-slate-900">{invoice.number}</td>
                  <td className="px-5 py-4">{client?.name}</td>
                  <td className="px-5 py-4">{invoice.invoiceDate}</td>
                  <td className="px-5 py-4 font-medium">{formatCurrency(invoice.total)}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
