'use client';

import { api } from '@/trpc/react';
import ProfileFormClient from '@/components/profile-form';

export default async function ProfileForm() {
  const { data: profile, isLoading } = await api.users.get.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  const defaultProfile = {
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    bio: profile?.bio || '',
    x_handle: profile?.x_handle || '',
    website: profile?.website || '',
  };

  return (
    <div className="flex w-screen justify-center p-8">
      <ProfileFormClient profile={defaultProfile} />
    </div>
  );
}
