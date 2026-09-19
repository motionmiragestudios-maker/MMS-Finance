import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/mock-data";
import { requireAuth } from "@/lib/require-auth";
import { QuotationActions } from "@/components/quotation-actions";
import { QuotationDocumentHeader } from "@/components/quotation-document-header";

export default async function QuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth();
  const { id } = await params;
  const project = await db.project.findUnique({ where: { id }, include: { client: true } });
  if (!project) notFound();

  return <main className="p-8">
    <Link className="text-button no-print" href="/projects">← Back to quotations</Link>
    <div className="invoice-detail-heading no-print"><div><p className="eyebrow">Quotation record</p><h1 className="text-3xl font-bold">{project.name}</h1><p className="muted">{project.client.name} · {project.startDate.toISOString().slice(0, 10)}</p></div><QuotationActions quotationId={project.id} /></div>
    <article className="quotation-paper">
      <QuotationDocumentHeader /><header className="quotation-header"><div><h2>{project.name}</h2><p>{project.description || "Quotation for creative production services."}</p></div><strong>{formatCurrency(project.quotationAmount)}</strong></header>
      <div className="quotation-meta"><div><span>Prepared for</span><strong>{project.client.name}</strong><small>{project.client.email}</small><small>{project.client.billingAddress}</small></div><div><span>Quotation date</span><strong>{project.startDate.toISOString().slice(0, 10)}</strong></div><div><span>Valid until</span><strong>{project.deliveryDate.toISOString().slice(0, 10)}</strong></div></div>
      <div className="quotation-total"><span>Quoted amount</span><strong>{formatCurrency(project.quotationAmount)}</strong></div>
      <p className="quotation-note">{project.notes || "This quotation is subject to the agreed scope and payment terms."}</p>
    </article>
  </main>;
}