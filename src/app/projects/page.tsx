import { projects } from "@/lib/mock-data";

export default function ProjectsPage() {
  return (
    <main className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Delivery pipeline</p>
          <h1 className="text-3xl font-bold">Projects</h1>
        </div>
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">New project</button>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{project.name}</h2>
                <p className="text-sm text-slate-500">{project.description}</p>
              </div>
              <span className="inline-flex rounded-full bg-indigo-100 px-2 py-1 text-[10px] font-medium text-indigo-700">
                {project.status}
              </span>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-4 text-sm text-slate-600">
              <div><span className="block text-slate-400">Shoot date</span>{project.shootDate}</div>
              <div><span className="block text-slate-400">Delivery</span>{project.deliveryDate}</div>
              <div><span className="block text-slate-400">Quotation</span>₹{project.quotationAmount.toLocaleString("en-IN")}</div>
              <div><span className="block text-slate-400">Expenses</span>₹{project.projectExpenses.toLocaleString("en-IN")}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
