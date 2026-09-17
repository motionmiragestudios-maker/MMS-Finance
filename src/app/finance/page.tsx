import { formatCurrency, incomeSummary } from "@/lib/mock-data";

const metrics = [
  { label: "Invoiced", value: formatCurrency(incomeSummary.totalInvoiced) },
  { label: "Received", value: formatCurrency(incomeSummary.totalReceived) },
  { label: "Outstanding", value: formatCurrency(incomeSummary.totalOutstanding) },
  { label: "Expenses", value: formatCurrency(incomeSummary.totalExpenses) },
  { label: "Net cash", value: formatCurrency(incomeSummary.netCashResult) },
];

export default function FinancePage() {
  return (
    <main className="p-8">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Performance</p>
        <h1 className="text-3xl font-bold">Finance</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-4 text-2xl font-semibold text-slate-900">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Financial report</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Income by month</p>
            <p className="mt-2 text-lg font-semibold">₹1.6L</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Expenses by category</p>
            <p className="mt-2 text-lg font-semibold">₹82K</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Project margin</p>
            <p className="mt-2 text-lg font-semibold">₹28K</p>
          </div>
        </div>
      </div>
    </main>
  );
}
