'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AuthGate({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // páginas públicas (adicione mais se precisar)
    const publicRoutes = ['/login'];
    const isPublic = publicRoutes.includes(pathname);

    const isLogged = typeof window !== 'undefined' && localStorage.getItem('loggedIn');

    if (!isLogged && !isPublic) {
      router.replace('/login');
    }
  }, [pathname, router]);

  return children;
}