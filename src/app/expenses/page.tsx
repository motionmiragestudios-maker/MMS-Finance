import { db } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import { FinanceRecordForm } from "@/components/finance-record-form";
import { ExpenseList } from "@/components/expense-list";

export default async function ExpensesPage() {
  await requireAuth();
  const [expenses, projects] = await Promise.all([
    db.expense.findMany({ include: { project: true }, orderBy: { date: "desc" } }),
    db.project.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  return (
    <main className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Operational cost</p>
          <h1 className="text-3xl font-bold">Expenses</h1>
        </div>
      </div>

      <div className="expense-create-area"><FinanceRecordForm kind="expense" projects={projects} /></div>

      <ExpenseList expenses={expenses.map((expense) => ({ id: expense.id, category: expense.category, vendor: expense.vendor, amount: expense.amount, date: expense.date.toISOString().slice(0, 10), method: expense.method, projectName: expense.project?.name ?? null }))} />
    </main>
  );
}
