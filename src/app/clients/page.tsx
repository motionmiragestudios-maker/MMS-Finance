import { clients, formatCurrency } from "@/lib/mock-data";

export default function ClientsPage() {
  return (
    <main className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">CRM</p>
          <h1 className="text-3xl font-bold">Clients</h1>
        </div>
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Add client</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {clients.map((client) => (
          <div key={client.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{client.name}</h2>
                <p className="text-sm text-slate-500">Contact: {client.contactPerson}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-medium text-emerald-700">
                {client.outstandingBalance > 0 ? "Open balance" : "Settled"}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>{client.email}</p>
              <p>{client.phone}</p>
              <p>{client.billingAddress}</p>
            </div>

            <div className="mt-5 border-t border-slate-200 pt-4 text-sm">
              <div className="flex justify-between">
                <span>Outstanding</span>
                <span className="font-semibold text-slate-900">{formatCurrency(client.outstandingBalance)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
