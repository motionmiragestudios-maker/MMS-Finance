import { DirectoryManager } from "@/components/directory-manager";
import { requireAuth } from "@/lib/require-auth";

export default async function VendorsPage() {
  await requireAuth();
  return <main className="p-8"><div className="mb-8"><p className="text-sm uppercase tracking-[0.2em] text-slate-500">Directory</p><h1 className="text-3xl font-bold">Vendors</h1><p className="mt-2 max-w-xl text-sm text-slate-500">Keep production partners and suppliers organized in one place.</p></div><DirectoryManager kind="vendors" /></main>;
}