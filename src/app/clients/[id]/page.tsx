import Link from "next/link";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/mock-data";
import { requireAuth } from "@/lib/require-auth";
import { notFound } from "next/navigation";
import { canManageRecords } from "@/lib/user-roles";
import { ClientEditor } from "@/components/client-editor";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  const { id } = await params;
  const client = await db.client.findUnique({ where: { id }, include: { invoices: { orderBy: { invoiceDate: "desc" } } } });
  if (!client) notFound();
  return <main className="p-8 client-detail-page"><Link className="text-button client-back-link" href="/clients">← All clients</Link><header className="client-detail-heading"><div className="record-avatar record-avatar--large">{client.name.slice(0, 1).toUpperCase()}</div><div><p className="eyebrow">Client account</p><h1>{client.name}</h1><p className="muted">{client.email} · {client.phone}</p></div><div className="client-detail-actions">{canManageRecords(session.user.role) && <ClientEditor client={client} />}<Link className="primary-button" href="/">Create invoice</Link></div></header><section className="client-information"><div><p className="block-label">Billing address</p><p>{client.billingAddress || "No billing address saved."}</p>{client.gst && <p className="client-gst">GST {client.gst}</p>}</div><div className="client-note-detail"><p className="block-label">Team notes</p><p>{client.notes || "No notes saved for this client yet."}</p></div></section><section className="client-billing-history"><div className="section-heading"><div><p className="eyebrow">Account activity</p><h2>Billing history <span>{client.invoices.length}</span></h2></div></div>{client.invoices.length ? <div className="invoice-history">{client.invoices.map((invoice) => <Link className="invoice-history-row" key={invoice.id} href={`/invoices/${invoice.id}`}><span><strong>{invoice.number}</strong><small>{invoice.invoiceDate.toISOString().slice(0, 10)}</small></span><span><strong>{formatCurrency(invoice.total)}</strong><small>{invoice.status}</small></span></Link>)}</div> : <p className="muted">No invoices have been created for this client yet.</p>}</section></main>;
}