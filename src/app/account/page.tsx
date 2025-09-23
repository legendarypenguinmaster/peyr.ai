import { requireAuth, requireProfile } from "@/lib/auth";
import AccountPageClient from "./AccountPageClient";

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const user = await requireAuth();
  const profile = await requireProfile();

  return <AccountPageClient user={user} profile={profile} />;
}
