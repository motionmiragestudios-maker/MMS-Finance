import { db } from "@/lib/db";
import { requireAuth } from "@/lib/require-auth";
import { FinanceRecordForm } from "@/components/finance-record-form";

export default async function ProjectsPage() {
  await requireAuth();
  const [projects, clients] = await Promise.all([
    db.project.findMany({ include: { client: true }, orderBy: { shootDate: "asc" } }),
    db.client.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  return (
    <main className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Sales pipeline</p>
          <h1 className="text-3xl font-bold">Quotations</h1>
        </div>
      </div>

      <div className="quotation-create-area"><FinanceRecordForm kind="project" clients={clients} /></div>

      <div className="space-y-4">
        {projects.length ? projects.map((project) => (
          <div key={project.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{project.name}</h2>
                <p className="text-sm text-slate-500">{project.client.name} · {project.description || "Quotation without description"}</p>
              </div>
              <span className="inline-flex rounded-full bg-indigo-100 px-2 py-1 text-[10px] font-medium text-indigo-700">
                {project.status.replace(/([a-z])([A-Z])/g, "$1 $2")}
              </span>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-4 text-sm text-slate-600">
              <div><span className="block text-slate-400">Quotation date</span>{project.startDate.toISOString().slice(0, 10)}</div>
              <div><span className="block text-slate-400">Valid until</span>{project.deliveryDate.toISOString().slice(0, 10)}</div>
              <div><span className="block text-slate-400">Quoted amount</span>₹{project.quotationAmount.toLocaleString("en-IN")}</div>
              <div><span className="block text-slate-400">Status</span>{project.status.replace(/([a-z])([A-Z])/g, "$1 $2")}</div>
            </div>
          </div>
        )) : <p className="muted">No quotations yet. Create your first quotation above.</p>}
      </div>
    </main>
  );
}
