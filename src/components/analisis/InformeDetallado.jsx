// frontend/src/components/analisis/InformeDetallado.jsx
'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import BadgeEstimado from '@/components/ui/BadgeEstimado';
import BarraProgreso from '@/components/ui/BarraProgreso';

const TABS = [
  { id: 'estrategia', etiqueta: 'Estrategia' },
  { id: 'demanda', etiqueta: 'Demanda' },
  { id: 'precios', etiqueta: 'Precios' },
  { id: 'plan', etiqueta: 'Plan 3M' },
  { id: 'riesgos', etiqueta: 'Riesgos' },
];

const COLORES_MES = ['#1D4E3A', '#E8923A', '#378ADD'];

export default function InformeDetallado({ informe }) {
  const [tab, setTab] = useState('estrategia');

  return (
    <div className="flex flex-col gap-3">
      <BadgeEstimado texto="Informe estimado con IA — no son cifras garantizadas" />

      <div className="flex bg-white rounded-xl p-0.5 gap-0.5 border border-borde">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 px-1 text-center text-[11px] font-medium rounded-[9px] transition whitespace-nowrap ${
              tab === t.id ? 'bg-verde text-white font-semibold' : 'text-gris'
            }`}
          >
            {t.etiqueta}
          </button>
        ))}
      </div>

      {tab === 'estrategia' && (
        <Card>
          <div className="text-xs font-semibold text-negro mb-2.5">🎯 Posicionamiento</div>
          <div className="text-[13px] text-gris leading-relaxed mb-3">{informe.estrategia.posicionamiento}</div>
          {informe.estrategia.pilares.map((p, i) => (
            <div key={i} className="border-l-[3px] border-verde pl-3 py-1 mb-2 last:mb-0">
              <div className="text-xs font-semibold text-negro mb-0.5">{p.titulo}</div>
              <div className="text-[11px] text-gris leading-relaxed">{p.descripcion}</div>
            </div>
          ))}
        </Card>
      )}

      {tab === 'demanda' && (
        <div className="flex flex-col gap-3">
          <Card>
            <div className="text-xs font-semibold text-negro mb-2.5">📈 Proyección de demanda</div>
            {informe.demanda.proyeccion.map((p, i) => (
              <div key={i} className="mb-3 last:mb-0">
                <BarraProgreso etiqueta={`${p.etiqueta} — inicio`} valor={p.valorInicial} maximo={p.valorMeta} color="#378ADD" />
                <BarraProgreso etiqueta={`${p.etiqueta} — meta mes 3`} valor={p.valorMeta} maximo={p.valorMeta} color="#1D4E3A" />
              </div>
            ))}
          </Card>
          <Card>
            <div className="text-xs font-semibold text-negro mb-2.5">💰 Ingresos estimados</div>
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr>
                  {['Periodo', 'Clientes', 'Ingresos'].map((h) => (
                    <th key={h} className="text-left text-gris font-medium py-1.5 border-b border-borde uppercase text-[10px]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {informe.demanda.ingresosEstimados.map((f, i) => (
                  <tr key={i} className={i === informe.demanda.ingresosEstimados.length - 1 ? 'font-semibold text-verde' : ''}>
                    <td className="py-2 border-b border-borde last:border-0">{f.periodo}</td>
                    <td className="py-2 border-b border-borde last:border-0">{f.clientesEstimados}</td>
                    <td className="py-2 border-b border-borde last:border-0">{f.ingresosEstimados}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-[11px] text-gris mt-2">{informe.demanda.ticketPromedio}</div>
          </Card>
        </div>
      )}

      {tab === 'precios' && (
        <div className="flex flex-col gap-3">
          <Card>
            <div className="text-xs font-semibold text-negro mb-2.5">🏷️ Estructura de precios sugerida</div>
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr>
                  {['Item', 'Precio', 'Margen'].map((h) => (
                    <th key={h} className="text-left text-gris font-medium py-1.5 border-b border-borde uppercase text-[10px]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {informe.precios.estructura.map((f, i) => (
                  <tr key={i}>
                    <td className="py-2 border-b border-borde last:border-0">{f.item}</td>
                    <td className="py-2 border-b border-borde last:border-0">{f.precioSugerido}</td>
                    <td className="py-2 border-b border-borde last:border-0">{f.margenEstimado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card>
            <div className="text-xs font-semibold text-negro mb-2">📊 Comparativo con la zona</div>
            <div className="text-[12px] text-gris leading-relaxed">{informe.precios.comparativoZona}</div>
          </Card>
        </div>
      )}

      {tab === 'plan' && (
        <div className="flex flex-col gap-2.5">
          {informe.planTresMeses.map((m, i) => (
            <MesAcordeon key={m.mes} mes={m} color={COLORES_MES[i % COLORES_MES.length]} abiertoInicial={i === 0} />
          ))}
        </div>
      )}

      {tab === 'riesgos' && (
        <Card>
          <div className="text-xs font-semibold text-negro mb-2.5">⚠️ Riesgos y mitigación</div>
          {informe.riesgos.map((r, i) => (
            <div key={i} className="border-l-[3px] border-ambar pl-3 py-1 mb-2 last:mb-0">
              <div className="text-xs font-semibold text-negro mb-0.5">{r.titulo}</div>
              <div className="text-[11px] text-gris leading-relaxed">{r.mitigacion}</div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function MesAcordeon({ mes, color, abiertoInicial }) {
  const [abierto, setAbierto] = useState(abiertoInicial);
  return (
    <div className="border border-borde rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center gap-2.5 px-3.5 py-3 text-left"
      >
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
          style={{ background: color }}
        >
          {mes.mes}
        </span>
        <span className="flex-1 text-[13px] font-semibold text-negro">{mes.titulo}</span>
        <span className="text-gris text-xs">{abierto ? '−' : '+'}</span>
      </button>
      {abierto && (
        <div className="px-3.5 pb-3.5 border-t border-borde pt-2.5 flex flex-col gap-1.5">
          <div className="text-[11px] font-medium text-verde mb-1">🎯 Meta: {mes.meta}</div>
          {mes.acciones.map((a, i) => (
            <div key={i} className="flex items-start gap-2 text-[12px] text-gris leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-verde flex-shrink-0 mt-1.5" />
              {a}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
