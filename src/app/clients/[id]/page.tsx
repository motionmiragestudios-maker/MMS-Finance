import Link from "next/link";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/mock-data";
import { requireAuth } from "@/lib/require-auth";
import { notFound } from "next/navigation";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth();
  const { id } = await params;
  const client = await db.client.findUnique({ where: { id }, include: { invoices: { orderBy: { invoiceDate: "desc" } } } });
  if (!client) notFound();
  return <main className="p-8"><Link className="text-button" href="/clients">← Back to clients</Link><div className="mb-8 mt-5"><p className="eyebrow">Client account</p><h1 className="text-3xl font-bold">{client.name}</h1><p className="muted">{client.email} · {client.phone}</p></div><section className="settings-panel"><div className="panel-heading"><div><p className="eyebrow">Billing history</p><h2>Invoices for {client.name}</h2></div><Link className="primary-button" href="/">Create invoice</Link></div>{client.invoices.length ? <div className="invoice-history">{client.invoices.map((invoice) => <Link className="invoice-history-row" key={invoice.id} href={`/invoices/${invoice.id}`}><span><strong>{invoice.number}</strong><small>{invoice.invoiceDate.toISOString().slice(0, 10)}</small></span><span><strong>{formatCurrency(invoice.total)}</strong><small>{invoice.status}</small></span></Link>)}</div> : <p className="muted">No invoices have been created for this client yet.</p>}</section></main>;
}