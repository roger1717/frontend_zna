// frontend/src/components/analisis/ResultadoAnalisisView.jsx
'use client';

import { useRouter } from 'next/navigation';
import { nombreSector } from '@/lib/constants';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import BadgeEstimado from '@/components/ui/BadgeEstimado';
import BarraProgreso from '@/components/ui/BarraProgreso';
import ScoreRing from '@/components/ui/ScoreRing';

// Vista del resultado de la Fase 1 (Estudio de Mercado). Renderiza EXACTAMENTE
// el contrato del backend de Fase 1 (score + metricas + tips + competidores),
// que es el entregable del PDF: texto corto + barras horizontales + 3 tips.
// Distingue con honestidad el DATO REAL (competidores de Google) de la
// ESTIMACIÓN de IA (barras y tips).

function descriptorScore(score) {
  if (score >= 70) return 'Zona favorable';
  if (score >= 45) return 'Zona moderada';
  return 'Zona desafiante';
}

function radioTexto(metros) {
  if (!metros) return '';
  return metros >= 1000 ? `${metros / 1000} km` : `${metros} m`;
}

// Barras del PDF (Nivel de Competencia, Densidad, Estrato, Demanda, Score).
const BARRAS = [
  { clave: 'score', etiqueta: 'Score de oportunidad', color: '#1d4e3a' },
  { clave: 'competencia', etiqueta: 'Nivel de competencia (más alto = menos saturado)', color: '#378add' },
  { clave: 'densidad', etiqueta: 'Densidad comercial', color: '#e8923a' },
  { clave: 'estrato', etiqueta: 'Estrato (nivel socioeconómico)', color: '#4ecdc4' },
  { clave: 'demanda', etiqueta: 'Demanda estimada', color: '#2a6b50' },
];

export default function ResultadoAnalisisView({ analisis, contexto }) {
  const router = useRouter();

  const metricas = analisis.metricas || {};
  const tips = analisis.tips || [];
  const competidores = analisis.competidores || [];
  const competidoresReales = analisis.fuente?.competidores === 'google_places';
  const iaReal = analisis.fuente?.ia && analisis.fuente.ia !== 'mock';

  const valores = { score: analisis.score, ...metricas };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[15px] font-bold text-negro font-display">
            {contexto?.sector ? nombreSector(contexto.sector) : 'Análisis'}
            {contexto?.zona ? ` · ${contexto.zona.split(',')[0]}` : ''}
          </div>
          <div className="text-[11px] text-gris">
            {contexto?.radioMetros ? `Radio ${radioTexto(contexto.radioMetros)} · ` : ''}
            análisis generado ahora
          </div>
        </div>
        <Button variant="outline" size="sm" fullWidth={false} onClick={() => router.push('/analizar')}>
          ← Nueva
        </Button>
      </div>


      {/* Puntaje + resumen corto (el "texto corto" del PDF). */}
      <div className="flex flex-col items-center gap-3 py-2">
        <ScoreRing score={analisis.score} size={96} />
        <div className="text-center">
          <div className="text-[13px] font-semibold text-negro">{descriptorScore(analisis.score)}</div>
          <div className="text-[13px] text-gris leading-relaxed mt-1 max-w-xs">{analisis.resumen}</div>
        </div>
      </div>

      {/* Barras horizontales (el "gráfico llamativo" del PDF). */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[13px] font-semibold text-negro">Indicadores de la zona</div>
          <BadgeEstimado texto="Estimado con IA" />
        </div>
        {BARRAS.map((b) => (
          <BarraProgreso
            key={b.clave}
            etiqueta={b.etiqueta}
            valor={Number.isFinite(valores[b.clave]) ? valores[b.clave] : 0}
            color={b.color}
          />
        ))}
      </Card>

      {/* Competidores reales (el DATO verificado, distinto de la estimación). */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[13px] font-semibold text-negro">
            Competidores detectados ({competidores.length})
          </div>
          <Badge tone={competidoresReales ? 'verde' : 'ambar'}>
            {competidoresReales ? 'Dato real (Google)' : 'Ejemplo'}
          </Badge>
        </div>
        <div className="flex flex-col gap-2">
          {competidores.length === 0 && (
            <Card className="text-center text-[13px] text-gris py-5">
              No se encontraron competidores en este radio.
            </Card>
          )}
          {competidores.map((c, i) => (
            <Card key={i} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[10px] bg-verde flex items-center justify-center text-base flex-shrink-0 text-white">
                🏪
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-negro truncate">{c.nombre}</div>
                <div className="text-[11px] text-gris">
                  {c.calificacion != null
                    ? `★ ${Number(c.calificacion).toFixed(1)} · ${c.totalResenas} reseñas`
                    : 'Sin calificación'}
                </div>
              </div>
              {c.direccion && <Badge tone="ambar">{c.direccion.split(',')[0]}</Badge>}
            </Card>
          ))}
        </div>
      </div>

      {/* 3 tips (las "viñetas de oro" del PDF). */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[13px] font-semibold text-negro">Recomendaciones para tu negocio</div>
          <BadgeEstimado texto="Estimado con IA" />
        </div>
        <div className="flex flex-col gap-2">
          {tips.map((t, i) => (
            <Card key={i} className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-arena flex items-center justify-center text-base flex-shrink-0">💡</div>
              <div className="flex-1 text-[12px] text-negro leading-relaxed">{t}</div>
            </Card>
          ))}
        </div>
      </div>

      {!iaReal && (
        <div className="text-[11px] text-gris text-center">
          Las métricas y recomendaciones son estimaciones de IA, no datos oficiales.
        </div>
      )}
    </>
  );
}
