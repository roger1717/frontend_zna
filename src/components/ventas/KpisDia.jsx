/* frontend/src/components/ventas/KpisDia.jsx */
import { TrendingDown, TrendingUp } from 'lucide-react';
import Card from '@/components/ui/Card';
import { formatoCOP, formatoCOPCorto, formatoNumero, formatoPorcentaje } from '@/lib/formato';

function Kpi({ etiqueta, valor, ayuda }) {
  return (
    <Card className="py-3 shadow-sm">
      <div className="text-[11px] text-gris mb-0.5">{etiqueta}</div>
      <div className="text-[17px] font-bold font-display text-negro leading-tight">{valor}</div>
      {ayuda && <div className="text-[10px] text-gris mt-0.5 leading-snug">{ayuda}</div>}
    </Card>
  );
}

export default function KpisDia({ kpis }) {
  const k = kpis || {};
  const variacion = k.variacion_vs_ayer_pct;
  const subio = Number(variacion) > 0;
  const hayComparacion = variacion !== null && variacion !== undefined;

  return (
    <div className="flex flex-col gap-2.5">
      {/* Tarjeta principal con la sombra pesada y el estilo del cliente */}
      <div className="bg-verde rounded-2xl p-5 shadow-md">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] text-white/70">Vendido hoy</span>
        </div>
        <div className="font-display font-extrabold text-white text-[32px] leading-none tracking-tight">
          {formatoCOP(k.ventas_hoy)}
        </div>
        <div className="flex items-center gap-3 mt-3 text-[12px] text-white/70">
          <span>{formatoNumero(k.ordenes_hoy)} {Number(k.ordenes_hoy) === 1 ? 'venta' : 'ventas'}</span>
          <span>·</span>
          <span>{formatoNumero(k.unidades_hoy)} unidades</span>
        </div>
        {/* Sin ventas ayer no hay porcentaje que calcular: se dice, no se inventa. */}
        {hayComparacion && (
          <div className={`inline-flex items-center gap-1 mt-3 px-2.5 py-1 rounded-full text-[11px] font-semibold ${subio ? 'bg-white/15 text-white' : 'bg-black/20 text-white/80'}`}>
            {subio ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {formatoPorcentaje(variacion)} vs. ayer
          </div>
        )}
      </div>

      {/* KPIs secundarios con sombra */}
      <div className="grid grid-cols-2 gap-2.5">
        <Kpi etiqueta="Ganancia de hoy" valor={formatoCOP(k.utilidad_hoy)} ayuda="Venta menos costo y Gasto" />
        <Kpi etiqueta="Compra promedio" valor={formatoCOP(k.ticket_promedio)} ayuda="Lo que gasta cada cliente" />
        <Kpi etiqueta="Vendido esta semana" valor={formatoCOPCorto(k.ingresos_semana)} ayuda="Últimos 7 días" />
        <Kpi etiqueta="Ganancia de la semana" valor={formatoCOPCorto(k.utilidad_semana)} ayuda={k.avance_semanal_pct === null || k.avance_semanal_pct === undefined ? 'Últimos 7 días' : `${formatoPorcentaje(k.avance_semanal_pct)} vs. semana anterior`} />
      </div>
    </div>
  );
}