// frontend/src/app/recuperar-contrasena/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthLayout from '@/components/layout/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

export default function RecuperarContrasenaPage() {
  const { recuperarContrasena, modoDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await recuperarContrasena(email);
      // Siempre mostramos el mismo mensaje, exista o no el correo: así no se
      // revela qué direcciones están registradas.
      setEnviado(true);
    } catch (err) {
      setError(err.message || 'No se pudo enviar el correo de recuperación.');
    } finally {
      setCargando(false);
    }
  }

  if (enviado) {
    return (
      <AuthLayout>
        <h1 className="font-display font-extrabold text-xl text-negro mb-1">Revisa tu correo</h1>
        <p className="text-[13px] text-gris mb-5">
          Si <span className="font-semibold text-negro">{email}</span> tiene una cuenta, te enviamos
          un enlace para crear una nueva contraseña. Puede tardar un par de minutos.
        </p>
        {modoDemo && (
          <Alert tone="demo" className="mb-4">
            Modo demo: no hay correo real. Con Supabase conectado, aquí llegaría el enlace de
            recuperación.
          </Alert>
        )}
        <Link href="/login">
          <Button variant="outline">Volver a iniciar sesión</Button>
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1 className="font-display font-extrabold text-xl text-negro mb-1">Recupera tu contraseña</h1>
      <p className="text-[13px] text-gris mb-5">
        Escribe tu correo y te enviamos un enlace para crear una nueva.
      </p>

      {modoDemo && (
        <Alert tone="demo" className="mb-4">
          Modo demo: no hay una cuenta de Supabase conectada todavía, así que no se envía un correo
          real.
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
        {error && <Alert tone="error">{error}</Alert>}
        <Button type="submit" loading={cargando} className="mt-1">
          Enviar enlace
        </Button>
      </form>

      <p className="text-center text-[13px] text-gris mt-5">
        ¿La recordaste?{' '}
        <Link href="/login" className="text-verde font-semibold">
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
