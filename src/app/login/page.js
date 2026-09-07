// frontend/src/app/login/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthLayout from '@/components/layout/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

export default function LoginPage() {
  const { login, modoDemo, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Si ya hay sesión, no tiene sentido mostrar el login: al inicio.
  useEffect(() => {
    if (!loading && user) router.replace('/');
  }, [loading, user, router]);

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await login(email, password);
      router.replace('/');
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="font-display font-extrabold text-xl text-negro mb-1">Inicia sesión</h1>
      <p className="text-[13px] text-gris mb-5">Analiza tu zona antes de invertir.</p>

      {modoDemo && (
        <Alert tone="demo" className="mb-4">
          Modo demo: no hay una cuenta de Supabase conectada todavía. Cualquier correo y contraseña te deja entrar.
        </Alert>
      )}

      <form onSubmit={manejarSubmit} className="flex flex-col gap-3.5">
        <Input
          label="Correo electrónico"
          type="email"
          placeholder="tucorreo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <Alert tone="error">{error}</Alert>}
        <Button type="submit" loading={cargando} className="mt-1">
          Iniciar sesión
        </Button>
      </form>

      <p className="text-center text-[13px] mt-4">
        <Link href="/recuperar-contrasena" className="text-verde font-semibold">
          ¿Olvidaste tu contraseña?
        </Link>
      </p>

      <p className="text-center text-[13px] text-gris mt-3">
        ¿No tienes cuenta?{' '}
        <Link href="/registro" className="text-verde font-semibold">
          Regístrate
        </Link>
      </p>
    </AuthLayout>
  );
}
