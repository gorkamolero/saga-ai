import { api } from "@/trpc/server";
import ProfileFormClient from "@/components/ProfileForm";

export default async function ProfileForm() {
  const profile = await api.users.get.query();

  const defaultProfile = {
    firstName: profile?.firstName || "",
    lastName: profile?.lastName || "",
    bio: profile?.bio || "",
    x_handle: profile?.x_handle || "",
    website: profile?.website || "",
  };

  return (
    <div className="flex w-screen justify-center p-8">
      <ProfileFormClient profile={defaultProfile} />
    </div>
  );
}
