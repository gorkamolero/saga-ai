'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const Redirector = ({ url }: { url: string }) => {
  const router = useRouter();

  useEffect(() => {
    router.push(url);
  }, []);

  return null;
};
