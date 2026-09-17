import { expenses, formatCurrency } from "@/lib/mock-data";
import { requireAuth } from "@/lib/require-auth";

export default async function ExpensesPage() {
  await requireAuth();
  return (
    <main className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Operational cost</p>
          <h1 className="text-3xl font-bold">Expenses</h1>
        </div>
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Add expense</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {expenses.map((expense) => (
          <div key={expense.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{expense.category}</h2>
                <p className="text-sm text-slate-500">{expense.vendor}</p>
              </div>
              <span className="text-lg font-semibold text-slate-900">{formatCurrency(expense.amount)}</span>
            </div>
            <div className="mt-4 text-sm text-slate-600">
              <p>{expense.date}</p>
              <p>{expense.method}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
