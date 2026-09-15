// RUTA DEL ARCHIVO: frontend/src/app/(app)/creditos/page.js
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { obtenerSaldosCredito } from '@/lib/api';
import { formatoCOP } from '@/lib/formato';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';

// Pantalla de solo lectura a propósito (Fase 3.9, alcance reducido): muestra
// cuánto debe cada cliente, pero MARCAR como pagado se hace desde Ventas →
// Últimas ventas (ahí sí existe la venta puntual a marcar). Aquí solo se ve el
// agregado por cliente — no hay un endpoint que liste las ventas pendientes de
// UN cliente en particular todavía.
export default function CreditosPage() {
  const { token } = useAuth();
  const [saldos, setSaldos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerSaldosCredito(token)
      .then((r) => {
        setSaldos(r.saldos);
      })
      .catch(() => setError('No se pudieron cargar los créditos.'))
      .finally(() => setCargando(false));
  }, [token]);

  const totalPorCobrar = saldos.reduce((suma, c) => suma + Number(c.saldo_pendiente), 0);

  if (cargando) {
    return (
      <div className="py-10">
        <Spinner label="Cargando créditos..." />
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="font-display font-bold text-lg text-negro mb-1">Créditos</div>
        <div className="text-[13px] text-gris leading-relaxed">
          Quién te debe y cuánto. Para marcar un pago, ve a Ventas → Últimas ventas.
        </div>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {saldos.length > 0 && (
        <div className="bg-rojo-claro rounded-2xl p-3.5 border-l-4 border-rojo">
          <div className="text-[11px] text-rojo font-semibold mb-0.5">Total por cobrar</div>
          <div className="font-display font-bold text-[22px] text-negro">{formatoCOP(totalPorCobrar)}</div>
        </div>
      )}

      {saldos.length === 0 && !error && (
        <EmptyState
          emoji="✅"
          titulo="No debes nada por cobrar"
          descripcion="Cuando registres una venta a crédito, aparecerá aquí hasta que la marques como pagada."
        />
      )}

      {saldos.length > 0 && (
        <div className="flex flex-col gap-2">
          {saldos.map((c) => (
            <Card key={c.cliente_id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-negro truncate">{c.nombre}</div>
                <div className="text-[11px] text-gris">
                  {c.ventas_pendientes} {c.ventas_pendientes === 1 ? 'venta pendiente' : 'ventas pendientes'}
                  {c.telefono ? ` · ${c.telefono}` : ''}
                </div>
              </div>
              <div className="text-[15px] font-bold font-display text-rojo flex-shrink-0">
                {formatoCOP(c.saldo_pendiente)}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}