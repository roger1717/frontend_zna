'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/layout/AppShell';
import Spinner from '@/components/ui/Spinner';

// Todas las pantallas dentro de (app) requieren sesión — incluso el plan
// Gratis necesita cuenta, porque el límite de 2 análisis/mes solo se
// puede contar de verdad si hay un usuario identificado (ver backend:
// analizar.js). El "(app)" en el nombre de la carpeta es un grupo de
// rutas de Next.js — no aparece en la URL.
export default function AppLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-arena">
        <Spinner label="Cargando..." />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
