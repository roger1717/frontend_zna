'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { obtenerHistorial } from '@/lib/api';
import { nombreSector, emojiSector } from '@/lib/constants';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

const ACCESOS = [
  { href: '/analizar', emoji: '📍', titulo: 'Nuevo análisis', sub: 'Analiza un negocio' },
  { href: '/verificar-nombre', emoji: '🔎', titulo: 'Verificar nombre', sub: 'RUES + SIC + .co' },
  { href: '/historial', emoji: '📊', titulo: 'Mis análisis', sub: 'Consulta el historial' },
  { href: '/planes', emoji: '💳', titulo: 'Planes y pagos', sub: 'Mejora tu plan' },
];

export default function DashboardPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [recientes, setRecientes] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerHistorial({ pagina: 1, porPagina: 3 }, token)
      .then((r) => setRecientes(r))
      .finally(() => setCargando(false));
  }, [token]);

  return (
    <>
      <div className="bg-verde rounded-2xl p-6 text-center">
        <div className="font-display font-extrabold text-2xl text-white mb-1.5 leading-tight tracking-tight">
          Conoce tu zona
          <br />
          antes de invertir
        </div>
        <div className="text-[13px] text-white/65 mb-5 leading-relaxed">
          Analiza competencia, demanda y oportunidades de cualquier zona de Colombia.
        </div>
        <Button variant="amber" onClick={() => router.push('/analizar')}>
          🔍 Iniciar análisis
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {ACCESOS.map((a) => (
          <Link key={a.href} href={a.href}>
            <Card className="text-center cursor-pointer hover:border-verde-suave transition h-full">
              <div className="text-3xl mb-1.5">{a.emoji}</div>
              <div className="text-xs font-semibold text-negro mb-0.5">{a.titulo}</div>
              <div className="text-[11px] text-gris">{a.sub}</div>
            </Card>
          </Link>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-semibold text-negro">Análisis recientes</span>
          <Link href="/historial" className="text-[11px] text-verde font-medium">
            Ver todos →
          </Link>
        </div>

        {cargando && <Spinner label="Cargando..." />}

        {!cargando && recientes?.items?.length === 0 && (
          <Card className="text-center text-[13px] text-gris py-6">Aún no tienes análisis guardados.</Card>
        )}

        {!cargando && recientes?.items?.length > 0 && (
          <div className="flex flex-col gap-2">
            {recientes.items.map((item) => (
              <Link key={item.id} href={`/historial/${item.id}`}>
                <Card className="flex items-center gap-3 cursor-pointer hover:border-verde-suave transition">
                  <div className="w-10 h-10 rounded-xl bg-verde flex items-center justify-center text-lg flex-shrink-0">
                    {emojiSector(item.sector)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-negro truncate">{item.zona}</div>
                    <div className="text-[11px] text-gris">{nombreSector(item.sector)}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold font-display text-verde">{item.score ?? '—'}</div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="bg-ambar-suave rounded-2xl p-3.5 border-l-4 border-ambar">
        <div className="text-xs font-semibold text-ambar-texto mb-1">🎉 Beta disponible — 13 sectores</div>
        <div className="text-xs text-ambar-texto2 leading-relaxed">
          Tiendas, restaurantes, farmacias, belleza, tecnología, veterinarias y más. Tu retroalimentación mejora la
          app, {user?.nombre || user?.email?.split('@')[0]}.
        </div>
      </div>
    </>
  );
}
