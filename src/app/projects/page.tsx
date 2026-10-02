import { db } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import { FinanceRecordForm } from "@/components/finance-record-form";
import Link from "next/link";
import { QuotationActions } from "@/components/quotation-actions";
import { canManageRecords } from "@/lib/user-roles";
import { SearchableTable, type SearchableTableRow } from "@/components/searchable-table";

export default async function ProjectsPage() {
  const session = await requireAuth();
  const [projects, clients] = await Promise.all([
    db.project.findMany({
      select: {
        id: true, quotationNumber: true, name: true, description: true, startDate: true,
        deliveryDate: true, quotationAmount: true, status: true,
        client: { select: { name: true } },
      },
      orderBy: { shootDate: "asc" },
    }),
    db.client.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  const canManage = canManageRecords(session.user.role);
  const columns = [
    { key: "number", label: "Quotation" }, { key: "name", label: "Title" }, { key: "client", label: "Client" },
    { key: "date", label: "Date" }, { key: "valid", label: "Valid until" }, { key: "amount", label: "Amount" },
    { key: "status", label: "Status" }, { key: "actions", label: "Actions" },
  ];
  const rows: SearchableTableRow[] = projects.map((project) => {
    const number = project.quotationNumber ?? "Not assigned";
    const status = project.status.replace(/([a-z])([A-Z])/g, "$1 $2");
    const date = project.startDate.toISOString().slice(0, 10);
    const validUntil = project.deliveryDate.toISOString().slice(0, 10);
    return {
      id: project.id,
      searchText: [number, project.name, project.client.name, project.description, date, validUntil, status, project.quotationAmount].join(" "),
      cells: [
        number,
        project.name,
        project.client.name,
        date,
        validUntil,
        `₹${project.quotationAmount.toLocaleString("en-IN")}`,
        status,
        <div className="record-actions" key="actions"><Link className="secondary-button" href={`/projects/${project.id}`}>View</Link><QuotationActions quotationId={project.id} showPrint={false} canDelete={canManage} /></div>,
      ],
    };
  });
  return (
    <main className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Sales pipeline</p>
          <h1 className="text-3xl font-bold">Quotations</h1>
        </div>
      </div>

      {canManage && <div className="quotation-create-area"><FinanceRecordForm kind="project" clients={clients} /></div>}
      <SearchableTable columns={columns} rows={rows} placeholder="Search quotations, titles, or clients..." emptyMessage="No quotations yet." />
    </main>
  );
}
