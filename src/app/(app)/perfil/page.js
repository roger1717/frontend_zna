// frontend/src/app/(app)/perfil/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { obtenerHistorial, obtenerPerfil } from '@/lib/api';
import { LIMITE_ANALISIS_PRUEBA } from '@/lib/constants';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const NOMBRE_PLAN = {
  prueba: 'Prueba',
  gratis: 'Prueba', // compatibilidad con sesiones viejas
};

export default function PerfilPage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [usoAnalisis, setUsoAnalisis] = useState(null);
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    obtenerPerfil(token).then((datos) => setPerfil(datos.perfil));

    obtenerHistorial({ pagina: 1, porPagina: 50 }, token).then((datos) => {
      setUsoAnalisis((datos.items || []).length);
    });
  }, [token]);

  async function manejarLogout() {
    await logout();
    router.push('/login');
  }

  const nombre =
    perfil?.nombre || user?.nombre || user?.user_metadata?.nombre || user?.email?.split('@')[0] || 'Usuario';
  const email = perfil?.email || user?.email;
  const planId = perfil?.plan || 'prueba';
  const nombrePlan = NOMBRE_PLAN[planId] || planId;
  const esPrueba = planId === 'prueba' || planId === 'gratis';
  const porcentajeUso =
    usoAnalisis != null ? Math.min(100, (usoAnalisis / LIMITE_ANALISIS_PRUEBA) * 100) : 0;

  return (
    <>
      <div className="font-display font-bold text-lg text-negro">Mi perfil</div>

      <Card className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-verde flex items-center justify-center text-3xl mx-auto mb-3">👤</div>
        <div className="text-[15px] font-semibold text-negro mb-1">{nombre}</div>
        <div className="text-xs text-gris mb-4">{email}</div>
        <div className="bg-ambar-suave rounded-xl p-3 text-left">
          <div className="text-xs font-semibold text-ambar-texto mb-1">🚀 Plan {nombrePlan}</div>
          <div className="text-xs text-ambar-texto2 leading-relaxed">
            {esPrueba
              ? '1 análisis de zona · hasta 5 productos · 1 servicio · radio 200 m. Los planes de pago se definirán después.'
              : 'Revisa los detalles de tu plan en Planes y pagos.'}
          </div>
        </div>
      </Card>

      <Card>
        <div className="text-[13px] font-semibold text-negro mb-3">Uso del plan {nombrePlan}</div>
        <div className="flex justify-between text-xs text-gris mb-1.5">
          <span>Análisis realizados</span>
          <span className="font-semibold text-negro">
            {usoAnalisis ?? '—'} / {LIMITE_ANALISIS_PRUEBA}
          </span>
        </div>
        <div className="h-2 bg-borde rounded-full overflow-hidden">
          <div className="h-full bg-verde rounded-full transition-all" style={{ width: `${porcentajeUso}%` }} />
        </div>
      </Card>

      <Card className="cursor-pointer hover:border-verde-suave transition" onClick={() => router.push('/planes')}>
        <div className="flex items-center gap-3">
          <div className="text-2xl">💳</div>
          <div className="flex-1">
            <div className="text-[13px] font-semibold text-negro">Planes y pagos</div>
            <div className="text-xs text-gris">Plan de prueba activo · pagos próximamente</div>
          </div>
          <div className="text-gris text-lg">›</div>
        </div>
      </Card>

      <Button variant="outline" onClick={manejarLogout}>
        Cerrar sesión
      </Button>
    </>
  );
}
