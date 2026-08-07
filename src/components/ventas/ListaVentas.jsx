'use client';

import { Undo2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import { fechaDeVenta, formatoCOP, horaDeVenta } from '@/lib/formato';

// Últimas ventas registradas, con la opción de anular.
//
// Anular repone el stock (lo hace el backend, en la misma transacción). Es la
// salida cuando el cliente devuelve algo o cuando el tendero se equivocó: sin
// esto tendría que "arreglarlo" registrando una venta al revés, que dejaría los
// números mintiendo.
export default function ListaVentas({ ventas = [], zonaHoraria, anulandoId, onAnular }) {
  if (ventas.length === 0) return null;

  return (
    <div>
      <div className="text-[13px] font-semibold text-negro mb-2">Últimas ventas</div>
      <div className="flex flex-col gap-2">
        {ventas.map((v) => (
          <Card key={v.id} className="py-3">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-gris mb-1">
                  {fechaDeVenta(v.ocurrida_en, zonaHoraria)} · {horaDeVenta(v.ocurrida_en, zonaHoraria)}
                </div>
                <div className="flex flex-col gap-0.5">
                  {(v.items || []).map((i) => (
                    <div key={i.id} className="text-[13px] text-negro truncate">
                      {i.cantidad} × {i.nombre_producto}
                    </div>
                  ))}
                </div>
                {v.nota && <div className="text-[11px] text-gris mt-1 italic">{v.nota}</div>}
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-[15px] font-bold font-display text-negro">{formatoCOP(v.total)}</div>
                <div className="text-[11px] text-verde-suave">+{formatoCOP(v.utilidad)} ganancia</div>
                <button
                  onClick={() => onAnular(v)}
                  disabled={anulandoId === v.id}
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-gris hover:text-rojo disabled:opacity-40"
                >
                  <Undo2 className="h-3 w-3" /> Anular
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
