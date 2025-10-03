'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ClientWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isLogged = typeof window !== 'undefined' && localStorage.getItem('loggedIn');

    // rotas públicas (não precisam de login)
    const publicRoutes = ['/', '/register'];

    if (!isLogged && !publicRoutes.includes(pathname)) {
      router.replace('/');
    }

    if (isLogged && pathname === '/') {
      router.replace('/inicio');
    }
  }, [pathname, router]);

  return <>{children}</>;
}