/* frontend/src/components/ventas/GraficoBarras7Dias.jsx */
'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import { diaCorto, diaYMes, esHoy, formatoCOP, formatoCOPCorto } from '@/lib/formato';

// Gráfico de los últimos 7 días con divs, sin librería de gráficos.
//
// Por qué sin librería: una librería de charts pesa entre 50 y 150 KB para
// dibujar siete rectángulos, y traería sus propios colores y tipografías que
// habría que peinar para que combinen. Con `height` en porcentaje sale igual,
// pesa cero y hereda el diseño de la app. (Decisión D5 del plan de la Fase 3.)
//
// El backend SIEMPRE manda 7 días, incluso los que no tuvieron ventas, así que
// aquí no hay que rellenar huecos: si un día vale 0, se dibuja una barra mínima
// para que se vea que el día existe y no vendió.
export default function GraficoBarras7Dias({ serie = [] }) {
  const [activo, setActivo] = useState(null);

  const maximo = Math.max(...serie.map((d) => Number(d.ingresos) || 0), 0);
  const sinVentas = maximo === 0;
  const detalle = activo ?? serie[serie.length - 1];

  return (
    <Card>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[13px] font-semibold text-negro">Últimos 7 días</span>
        {!sinVentas && <span className="text-[11px] text-gris">máx. {formatoCOPCorto(maximo)}</span>}
      </div>

      {/* Detalle de la barra que se toca. Por defecto muestra hoy, así la
          información útil está visible sin necesidad de interactuar. */}
      <div className="text-[11px] text-gris mb-3 h-4">
        {detalle && (
          <>
            <span className="font-semibold text-negro">{formatoCOP(detalle.ingresos)}</span>
            {' · '}
            {diaYMes(detalle.dia)}
            {' · '}
            {Number(detalle.ordenes)} {Number(detalle.ordenes) === 1 ? 'venta' : 'ventas'}
          </>
        )}
      </div>

      <div className="flex items-end gap-1.5 h-28">
        {serie.map((d) => {
          const valor = Number(d.ingresos) || 0;
          const alto = sinVentas ? 2 : Math.max(2, (valor / maximo) * 100);
          const hoy = esHoy(d.dia);
          const seleccionado = detalle?.dia === d.dia;

          return (
            <button
              key={d.dia}
              type="button"
              onClick={() => setActivo(d)}
              className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
              aria-label={`${diaYMes(d.dia)}: ${formatoCOP(valor)}`}
            >
              <div
                className={`w-full rounded-t-md transition-all duration-500 ${
                  hoy ? 'bg-verde' : seleccionado ? 'bg-verde-suave' : 'bg-verde-claro2'
                }`}
                style={{ height: `${alto}%` }}
              />
              <span className={`text-[10px] ${hoy ? 'text-verde font-semibold' : 'text-gris'}`}>
                {diaCorto(d.dia)}
              </span>
            </button>
          );
        })}
      </div>

      {sinVentas && (
        <div className="text-[12px] text-gris text-center mt-3">
          Todavía no hay ventas esta semana. Registra la primera arriba.
        </div>
      )}
    </Card>
  );
}
