import { SettingsForm } from "@/components/settings-form";
import { requireAuth } from "@/lib/require-auth";

export default async function SettingsPage() {
  await requireAuth();
  return <main className="p-8"><div className="mb-8"><p className="text-sm uppercase tracking-[0.2em] text-slate-500">Workspace</p><h1 className="text-3xl font-bold">Settings</h1><p className="mt-2 max-w-xl text-sm text-slate-500">Control the identity and defaults used in your invoices.</p></div><SettingsForm /></main>;
}
