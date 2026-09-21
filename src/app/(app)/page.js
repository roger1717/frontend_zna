// frontend/src/app/(app)/page.js

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { obtenerHistorial, obtenerNotaInicio } from '@/lib/api';
import { nombreSector, emojiSector } from '@/lib/constants';
import { formatoCOP, formatoNumero } from '@/lib/formato';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import ChipIA from '@/components/ui/ChipIA';
import ChipReal from '@/components/ui/ChipReal';

// "sábado" → "Sábado" para el título de la tarjeta "Tu mejor día".
function capitalizar(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [recientes, setRecientes] = useState(null);
  const [nota, setNota] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerHistorial({ pagina: 1, porPagina: 3 }, token)
      .then((r) => setRecientes(r))
      .finally(() => setCargando(false));
  }, [token]);

  // Nota del Gerente IA para Inicio: saludo + resumen proactivo (ventas de la
  // semana, comparación con la pasada y alerta de stock). Opcional: si el
  // backend falla, el home sigue funcionando sin la tarjeta.
  useEffect(() => {
    let activo = true;
    obtenerNotaInicio(token).then((n) => {
      if (activo) setNota(n);
    });
    return () => {
      activo = false;
    };
  }, [token]);

  return (
    <>
      <div className="mb-1">
        <h1 className="font-display font-extrabold text-[26px] text-negro leading-tight tracking-tight">
          {nota?.saludo ?? 'Tu negocio, al día'}
        </h1>
        <p className="text-[13px] text-gris mt-0.5">
          {user?.nombre
            ? `Este es el resumen de ${user.nombre}`
            : 'Este es el resumen de tu negocio'}
        </p>
      </div>

      {nota && (
        <div className="bg-ia-fondo border border-ia/20 rounded-2xl p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-ia">
              Nota de tu gerente IA · esta mañana
            </span>
            <ChipIA texto="Gerente IA" />
          </div>
          <div className="text-[14px] text-negro leading-relaxed">
            {nota.kpis?.ingresos_semana > 0 ? (
              <p>
                Vas bien: esta semana llevas{' '}
                <span className="font-semibold">{formatoCOP(nota.kpis.ingresos_semana)}</span>{' '}
                en ventas
                {nota.kpis.avance_semanal_pct != null && (
                  nota.kpis.avance_semanal_pct >= 0
                    ? `, ${formatoNumero(nota.kpis.avance_semanal_pct)}% más que la pasada`
                    : `, ${formatoNumero(Math.abs(nota.kpis.avance_semanal_pct))}% menos que la pasada`
                )}
                .
              </p>
            ) : (
              <p>
                Aún no hay ventas registradas esta semana. Registra tu primera venta y aquí te
                cuento cómo va tu negocio.
              </p>
            )}
            {nota.alerta_stock ? (
              <p>
                Ojo con la bodega:{' '}
                <span className="font-semibold">{nota.alerta_stock.nombre}</span> se acaba en
                unos <span className="font-semibold">{Math.round(nota.alerta_stock.dias_cobertura)} días</span>{' '}
                <span className="text-gris text-[12px]">(estimación)</span>.
              </p>
            ) : (
              <p>Tu bodega está en buen nivel: nada por agotarse.</p>
            )}
          </div>
          <Link
            href="/chat"
            className="inline-flex items-center gap-1 mt-2.5 text-[12px] font-semibold text-ia"
          >
            Preguntarle al gerente
            <span aria-hidden>→</span>
          </Link>
        </div>
      )}

      {/* Ventas de la semana — dato real (tarjeta del prototipo) */}
      {nota && (
        <Card className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[13px] text-gris">Ventas de la semana</div>
            <div className="font-display font-bold text-[24px] text-negro leading-none mt-1">
              {formatoCOP(nota.kpis?.ingresos_semana ?? 0)}
            </div>
            {nota.kpis?.avance_semanal_pct != null && (
              <div
                className={`mt-1.5 text-[13px] font-semibold flex items-center gap-1 ${
                  nota.kpis.avance_semanal_pct >= 0 ? 'text-verde' : 'text-rojo'
                }`}
              >
                {nota.kpis.avance_semanal_pct >= 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                {nota.kpis.avance_semanal_pct >= 0 ? '+' : ''}
                {formatoNumero(Math.abs(nota.kpis.avance_semanal_pct))}% frente a la semana pasada
              </div>
            )}
          </div>
          <ChipReal />
        </Card>
      )}

      {/* ¿Estás ganando plata esta semana? — utilidad real + cifra aproximada */}
      {nota && (
        <Card>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="text-[13px] text-gris">¿Estás ganando plata esta semana?</div>
            <ChipIA texto="Estimación" />
          </div>
          {nota.kpis?.utilidad_semana != null && (
            <>
              <div
                className={`font-display font-bold text-[20px] leading-none ${
                  nota.kpis.utilidad_semana >= 0 ? 'text-verde' : 'text-rojo'
                }`}
              >
                Te quedan ~{formatoCOP(nota.kpis.utilidad_semana)}
              </div>
              <p className="text-[12px] text-gris leading-relaxed mt-1.5">
                Ventas menos gastos de la semana y el costo de la mercancía. Cifra aproximada:
                se afina con lo que registres.
              </p>
            </>
          )}
        </Card>
      )}

      {/* Tu mejor día — dato real (migración mejor_dia_ventas) */}
      {nota?.mejor_dia && (
        <Card className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[13px] text-gris">Tu mejor día</div>
            <div className="font-display font-bold text-[20px] text-negro mt-0.5">
              El {capitalizar(nota.mejor_dia.nombre_dia)} 🎯
            </div>
            <p className="text-[12px] text-gris leading-relaxed mt-1">
              {nota.mejor_dia.semanas_con_datos >= 2
                ? `Casi siempre vendes más los ${nota.mejor_dia.nombre_dia} (promedio de ${nota.mejor_dia.semanas_con_datos} semanas).`
                : 'Con las ventas que llevas registradas, este es tu día más fuerte.'}
            </p>
          </div>
          <ChipReal />
        </Card>
      )}

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

    </>
  );
}
