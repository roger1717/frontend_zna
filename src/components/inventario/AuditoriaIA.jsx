'use client';

import { AlertTriangle, Lightbulb } from 'lucide-react';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import BadgeEstimado from '@/components/ui/BadgeEstimado';
import EmptyState from '@/components/ui/EmptyState';

// Muestra el resultado de la Auditoría IA:
//  - alertas ROJAS: productos por agotarse.
//  - estrategias AZULES: oportunidades / capital estancado.
// Todo marcado como ESTIMACIÓN DE IA (regla de honestidad).
export default function AuditoriaIA({ auditoria }) {
  if (!auditoria) return null;

  const { resumen, alertas = [], estrategias = [], demo } = auditoria;
  const sinHallazgos = alertas.length === 0 && estrategias.length === 0;

  return (
    <div className="flex flex-col gap-3">
      {demo && (
        <Alert tone="demo">
          Auditoría de ejemplo — conecta la IA (Groq) y tu cuenta real para un análisis sobre tus datos.
        </Alert>
      )}

      <Card className="border-l-[3px] border-l-azul">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[13px] font-semibold text-negro">Resumen de la auditoría</span>
          <BadgeEstimado />
        </div>
        <div className="text-[13px] text-gris leading-relaxed">{resumen}</div>
      </Card>

      {sinHallazgos && (
        <EmptyState
          emoji="✅"
          titulo="Todo en orden"
          descripcion="La IA no encontró alertas ni oportunidades urgentes con tus datos actuales."
        />
      )}

      {alertas.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2 text-[13px] font-semibold text-negro">
            <AlertTriangle className="h-4 w-4 text-rojo" /> Alertas ({alertas.length})
          </div>
          <div className="flex flex-col gap-2">
            {alertas.map((a, i) => (
              <Card key={i} className="border-l-[3px] border-l-rojo bg-rojo-claro/40">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[13px] font-semibold text-negro">{a.producto}</span>
                  <Badge tone={a.severidad === 'alta' ? 'rojo' : 'ambar'}>
                    {a.severidad === 'alta' ? 'Urgente' : 'Atención'}
                  </Badge>
                </div>
                <div className="text-[12px] text-gris leading-relaxed">{a.motivo}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {estrategias.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2 text-[13px] font-semibold text-negro">
            <Lightbulb className="h-4 w-4 text-azul-oscuro" /> Estrategias ({estrategias.length})
          </div>
          <div className="flex flex-col gap-2">
            {estrategias.map((e, i) => (
              <Card key={i} className="border-l-[3px] border-l-azul bg-azul-claro/40">
                <div className="text-[13px] font-semibold text-negro mb-1">{e.titulo}</div>
                <div className="text-[12px] text-gris leading-relaxed">{e.detalle}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="text-[11px] text-gris text-center">
        Las alertas y estrategias son estimaciones de IA, no garantías. Tu stock y precios sí son datos reales.
      </div>
    </div>
  );
}
