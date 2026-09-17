import { formatCurrency, payments } from "@/lib/mock-data";
import { requireAuth } from "@/lib/require-auth";

export default async function PaymentsPage() {
  await requireAuth();
  return (
    <main className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Cash collection</p>
          <h1 className="text-3xl font-bold">Payments</h1>
        </div>
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Record payment</button>
      </div>

      <div className="space-y-4">
        {payments.map((payment) => (
          <div key={payment.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-slate-900">{payment.reference}</div>
                <div className="text-sm text-slate-500">{payment.method} • {payment.date}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">{formatCurrency(payment.amount)}</div>
                <div className="text-xs text-slate-500">Received</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
