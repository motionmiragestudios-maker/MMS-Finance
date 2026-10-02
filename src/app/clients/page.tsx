import { DirectoryManager } from "@/components/directory-manager";
import { requireAuth } from "@/lib/require-auth";
import { canManageRecords } from "@/lib/user-roles";

export default async function ClientsPage() {
  const session = await requireAuth();
  return <main className="p-8"><header className="directory-page-heading"><p className="eyebrow">Client directory</p><h1>Clients</h1><p>Billing contacts, preferences, and account history in one place.</p></header><DirectoryManager kind="clients" canManage={canManageRecords(session.user.role)} /></main>;
}
