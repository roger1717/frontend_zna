'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { obtenerHistorial } from '@/lib/api';
import { LIMITE_ANALISIS_GRATIS_MES } from '@/lib/constants';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function PerfilPage() {
  const { user, token, logout, modoDemo } = useAuth();
  const router = useRouter();
  const [usoDelMes, setUsoDelMes] = useState(null);

  useEffect(() => {
    // No existe todavía un endpoint dedicado de "mi plan y mi uso" en el
    // backend — esto es una aproximación calculada desde el historial
    // reciente, suficiente para el plan Gratis (que por definición tiene
    // pocos análisis). Si se agrega un GET /api/perfil más adelante, esta
    // pantalla debería usarlo en vez de este cálculo.
    obtenerHistorial({ pagina: 1, porPagina: 50 }, token).then((datos) => {
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);
      const delMes = (datos.items || []).filter((i) => new Date(i.created_at) >= inicioMes);
      setUsoDelMes(delMes.length);
    });
  }, [token]);

  async function manejarLogout() {
    await logout();
    router.push('/login');
  }

  const nombre = user?.nombre || user?.user_metadata?.nombre || user?.email?.split('@')[0] || 'Usuario';
  const porcentajeUso = usoDelMes != null ? Math.min(100, (usoDelMes / LIMITE_ANALISIS_GRATIS_MES) * 100) : 0;

  return (
    <>
      <div className="font-display font-bold text-lg text-negro">Mi perfil</div>

      <Card className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-verde flex items-center justify-center text-3xl mx-auto mb-3">👤</div>
        <div className="text-[15px] font-semibold text-negro mb-1">{nombre}</div>
        <div className="text-xs text-gris mb-4">{user?.email}</div>
        <div className="bg-ambar-suave rounded-xl p-3 text-left">
          <div className="text-xs font-semibold text-ambar-texto mb-1">🚀 Plan Gratis</div>
          <div className="text-xs text-ambar-texto2 leading-relaxed">
            2 análisis por mes · radio fijo de 200 m. Mejora a Pro por $39.900/mes para análisis completos sin
            límite.
          </div>
        </div>
      </Card>

      <Card>
        <div className="text-[13px] font-semibold text-negro mb-3">Uso del mes (plan Gratis)</div>
        <div className="flex justify-between text-xs text-gris mb-1.5">
          <span>Análisis realizados</span>
          <span className="font-semibold text-negro">
            {usoDelMes ?? '—'} / {LIMITE_ANALISIS_GRATIS_MES}
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
            <div className="text-xs text-gris">Mejora tu plan o revisa precios</div>
          </div>
          <div className="text-gris text-lg">›</div>
        </div>
      </Card>

      {modoDemo && (
        <div className="text-[11px] text-gris text-center px-4">
          Estás en modo demo — tu sesión vive solo en este navegador, no en una cuenta real.
        </div>
      )}

      <Button variant="outline" onClick={manejarLogout}>
        Cerrar sesión
      </Button>
    </>
  );
}
