import { requireAuth, requireProfile } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  // This will redirect to sign-in if not authenticated
  await requireAuth();

  // This will redirect to role selection if no profile
  const profile = await requireProfile();

  // Redirect to the user's own profile page
  redirect(`/profile/${profile.id}`);
}
