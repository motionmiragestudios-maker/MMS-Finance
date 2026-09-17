import { requireAuth } from "@/lib/require-auth";
import { UserManager } from "@/components/user-manager";

export default async function ProfilePage() {
  await requireAuth();
  return <main className="p-8"><div className="mb-8"><p className="text-sm uppercase tracking-[0.2em] text-slate-500">User access</p><h1 className="text-3xl font-bold">Profile & security</h1></div><UserManager /></main>;
}
