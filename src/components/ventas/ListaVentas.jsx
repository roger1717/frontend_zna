/* RUTA DEL ARCHIVO: frontend/src/components/ventas/ListaVentas.jsx */
'use client';

import { CircleDollarSign, Undo2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { fechaDeVenta, formatoCOP, horaDeVenta } from '@/lib/formato';

// `onMarcarPagada` es opcional a propósito: si el padre no lo pasa (por
// ejemplo, una vista de solo lectura en el futuro), el botón simplemente no
// aparece en vez de romper.
export default function ListaVentas({ ventas = [], zonaHoraria, anulandoId, marcandoPagoId, onAnular, onMarcarPagada }) {
  if (ventas.length === 0) return null;

  return (
    <div>
      <div className="text-[13px] font-semibold text-negro mb-2">Últimas ventas</div>
      <div className="flex flex-col gap-2">
        {ventas.map((v) => {
          const esCredito = v.metodo_pago === 'credito';
          const debe = esCredito && !v.pagado_en;

          return (
            <Card key={v.id} className="py-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[12px] text-gris">
                      {fechaDeVenta(v.ocurrida_en, zonaHoraria)} · {horaDeVenta(v.ocurrida_en, zonaHoraria)}
                    </span>
                    {esCredito && <Badge tone={debe ? 'rojo' : 'verde'}>{debe ? 'Debe' : 'Pagada'}</Badge>}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {(v.items || []).map((i) => (
                      <div key={i.id} className="text-[13px] text-negro truncate">
                        {i.cantidad} × {i.nombre_producto}
                      </div>
                    ))}
                  </div>
                  {esCredito && v.cliente && (
                    <div className="text-[11px] text-gris mt-1">Cliente: {v.cliente.nombre}</div>
                  )}
                  {v.nota && <div className="text-[11px] text-gris mt-1 italic">{v.nota}</div>}
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-[15px] font-bold font-display text-negro">{formatoCOP(v.total)}</div>
                  <div className="text-[11px] text-verde-suave">+{formatoCOP(v.utilidad)} ganancia</div>

                  <div className="flex flex-col items-end gap-1 mt-1.5">
                    {debe && onMarcarPagada && (
                      <button
                        onClick={() => onMarcarPagada(v)}
                        disabled={marcandoPagoId === v.id}
                        className="inline-flex items-center gap-1 text-[11px] text-verde font-medium hover:text-verde-suave disabled:opacity-40"
                      >
                        <CircleDollarSign className="h-3 w-3" /> Marcar pagada
                      </button>
                    )}
                    <button
                      onClick={() => onAnular(v)}
                      disabled={anulandoId === v.id}
                      className="inline-flex items-center gap-1 text-[11px] text-gris hover:text-rojo disabled:opacity-40"
                    >
                      <Undo2 className="h-3 w-3" /> Anular
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
