import { db } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import { FinanceRecordForm } from "@/components/finance-record-form";
import { PaymentList } from "@/components/payment-list";
import { canManageRecords } from "@/lib/user-roles";

export default async function PaymentsPage() {
  const session = await requireAuth();
  const [payments, invoices] = await Promise.all([
    db.payment.findMany({
      select: {
        id: true, amount: true, reference: true, method: true, date: true,
        client: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    }),
    db.invoice.findMany({ select: { id: true, number: true }, orderBy: { invoiceDate: "desc" } }),
  ]);
  return (
    <main className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Cash collection</p>
          <h1 className="text-3xl font-bold">Payments</h1>
        </div>
      </div>

      {canManageRecords(session.user.role) && <div className="payment-create-area"><FinanceRecordForm kind="payment" invoices={invoices} /></div>}

      <PaymentList canManage={canManageRecords(session.user.role)} payments={payments.map((payment) => ({ id: payment.id, clientName: payment.client.name, amount: payment.amount, reference: payment.reference, method: payment.method, date: payment.date.toISOString().slice(0, 10) }))} />
    </main>
  );
}
