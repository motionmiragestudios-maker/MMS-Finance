import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/mock-data";
import { requireAuth } from "@/lib/require-auth";
import { QuotationActions } from "@/components/quotation-actions";
import { InvoicePaymentDetails } from "@/components/invoice-payment-details";
import { SavedInvoiceHeader } from "@/components/saved-invoice-header";

export default async function QuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth();
  const { id } = await params;
  const [project, company] = await Promise.all([
    db.project.findUnique({ where: { id }, include: { client: true } }),
    db.companyProfile.findUnique({ where: { id: "company" }, select: { upiDetails: true } }),
  ]);
  if (!project) notFound();

  return <main className="p-8">
    <Link className="text-button no-print" href="/projects">← Back to quotations</Link>
    <div className="invoice-detail-heading no-print"><div><p className="eyebrow">Quotation record</p><h1 className="text-3xl font-bold">{project.name}</h1><p className="muted">{project.client.name} · {project.startDate.toISOString().slice(0, 10)}</p></div><QuotationActions quotationId={project.id} /></div>
    <article className="invoice-paper saved-invoice-paper">
      <SavedInvoiceHeader documentLabel="QUOTATION" fallbackUpi={company?.upiDetails ?? ""} />
      <div className="invoice-meta"><div><span>Quotation number</span><strong>{project.id}</strong></div><div><span>Issue date</span><strong>{project.startDate.toISOString().slice(0, 10)}</strong></div><div><span>Valid until</span><strong>{project.deliveryDate.toISOString().slice(0, 10)}</strong></div></div>
      <div className="bill-to"><div className="block-label">Prepared for</div><strong>{project.client.name}</strong><span>{project.client.billingAddress}</span><span>{project.client.email}</span><span>{project.client.phone}</span></div>
      <div className="service-heading"><h3>Description of services</h3><span>1 line</span></div><table className="service-table"><thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody><tr><td>{project.description || "Creative production services"}</td><td>1</td><td>{formatCurrency(project.quotationAmount)}</td><td>{formatCurrency(project.quotationAmount)}</td></tr></tbody></table>
      <div className="invoice-total"><span>Total quoted</span><strong>{formatCurrency(project.quotationAmount)}</strong></div>
      <div className="invoice-footer"><div><div className="block-label">Quotation note</div><p>{project.notes || "This quotation is subject to the agreed scope and payment terms."}</p></div><InvoicePaymentDetails amount={project.quotationAmount} fallbackUpi={company?.upiDetails ?? ""} /><div className="thank-you">Thank you<br /><strong>for your business.</strong></div></div>
    </article>
  </main>;
}