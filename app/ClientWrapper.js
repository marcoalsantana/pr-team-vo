'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ClientWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isLogged = typeof window !== 'undefined' && localStorage.getItem('loggedIn');
    const isLogin = pathname === '/';

    if (!isLogged && !isLogin) {
      router.replace('/');
    }

    if (isLogged && isLogin) {
      router.replace('/inicio');
    }
  }, [pathname, router]);

  return <>{children}</>;
}