// frontend/src/app/registro/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthLayout from '@/components/layout/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

export default function RegistroPage() {
  const { registro, modoDemo, user, loading } = useAuth();
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [confirmacion, setConfirmacion] = useState(false);

  // Si ya hay sesión, no mostramos el registro. (No aplica cuando acabamos de
  // pedir confirmación de correo: ahí todavía no hay sesión.)
  useEffect(() => {
    if (!loading && user && !confirmacion) router.replace('/');
  }, [loading, user, confirmacion, router]);

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setCargando(true);
    try {
      const { necesitaConfirmacion } = await registro(email, password, nombre);
      if (necesitaConfirmacion) {
        setConfirmacion(true); // producción con verificación de correo activada
      } else {
        router.replace('/');
      }
    } catch (err) {
      setError(err.message || 'No se pudo crear la cuenta.');
    } finally {
      setCargando(false);
    }
  }

  if (confirmacion) {
    return (
      <AuthLayout>
        <h1 className="font-display font-extrabold text-xl text-negro mb-1">Revisa tu correo</h1>
        <p className="text-[13px] text-gris mb-5">
          Te enviamos un enlace a <span className="font-semibold text-negro">{email}</span> para
          confirmar tu cuenta. Ábrelo y luego inicia sesión.
        </p>
        <Button onClick={() => router.push('/login')}>Ir a iniciar sesión</Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1 className="font-display font-extrabold text-xl text-negro mb-1">Crea tu cuenta</h1>
      <p className="text-[13px] text-gris mb-5">Empieza gratis — 2 análisis por mes.</p>

      {modoDemo && (
        <Alert tone="demo" className="mb-4">
          Modo demo: no hay una cuenta de Supabase conectada todavía. Se crea una sesión local en tu navegador.
        </Alert>
      )}

      <form onSubmit={manejarSubmit} className="flex flex-col gap-3.5">
        <Input label="Nombre" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
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
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <Alert tone="error">{error}</Alert>}
        <Button type="submit" loading={cargando} className="mt-1">
          Crear cuenta
        </Button>
      </form>

      <p className="text-center text-[13px] text-gris mt-5">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-verde font-semibold">
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
