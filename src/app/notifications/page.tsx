import { NotificationSettings } from "@/components/notification-settings";
import { requireAuth } from "@/lib/require-auth";

export default async function NotificationsPage() {
  const session = await requireAuth();
  if (session.user.role !== "owner") {
    return <main className="p-8"><header className="directory-page-heading"><p className="eyebrow">Workspace</p><h1>Notifications</h1><p>Only the owner can configure email delivery and Discord alerts.</p></header></main>;
  }

  return <main className="p-8"><header className="directory-page-heading"><p className="eyebrow">Delivery & alerts</p><h1>Notifications</h1><p>Configure account setup emails and team activity alerts.</p></header><NotificationSettings /></main>;
}