'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthLayout from '@/components/layout/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

// A esta pantalla llega el usuario desde el enlace del correo de recuperación.
// supabase-js detecta el token en la URL y abre una sesión temporal; con ella,
// updateUser() puede fijar la nueva contraseña. Por eso es una ruta pública
// (fuera del grupo (app)): el usuario aún no "inició sesión" normalmente.
export default function ActualizarContrasenaPage() {
  const { actualizarContrasena, modoDemo } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [listo, setListo] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== password2) {
      setError('Las dos contraseñas no coinciden.');
      return;
    }

    setCargando(true);
    try {
      await actualizarContrasena(password);
      setListo(true);
    } catch (err) {
      setError(
        err.message ||
          'No se pudo cambiar la contraseña. El enlace pudo vencer; pide uno nuevo.',
      );
    } finally {
      setCargando(false);
    }
  }

  if (listo) {
    return (
      <AuthLayout>
        <h1 className="font-display font-extrabold text-xl text-negro mb-1">Contraseña cambiada</h1>
        <p className="text-[13px] text-gris mb-5">Ya puedes entrar con tu nueva contraseña.</p>
        <Button onClick={() => router.replace('/')}>Ir a la app</Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1 className="font-display font-extrabold text-xl text-negro mb-1">Nueva contraseña</h1>
      <p className="text-[13px] text-gris mb-5">Escribe la nueva contraseña de tu cuenta.</p>

      {modoDemo && (
        <Alert tone="demo" className="mb-4">
          Modo demo: sin Supabase conectado no hay un enlace de recuperación real que validar.
        </Alert>
      )}

      <form onSubmit={manejarSubmit} className="flex flex-col gap-3.5">
        <Input
          label="Nueva contraseña"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          label="Repite la contraseña"
          type="password"
          placeholder="••••••••"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          required
        />
        {error && <Alert tone="error">{error}</Alert>}
        <Button type="submit" loading={cargando} className="mt-1">
          Guardar contraseña
        </Button>
      </form>

      <p className="text-center text-[13px] text-gris mt-5">
        <Link href="/login" className="text-verde font-semibold">
          Volver a iniciar sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
