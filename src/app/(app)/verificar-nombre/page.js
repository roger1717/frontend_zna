// frontend/src/app/(app)/verificar-nombre/page.js
'use client';

import { useState } from 'react';
import { CircleCheck, TriangleAlert, CircleX } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { verificarNombre } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import BadgeEstimado from '@/components/ui/BadgeEstimado';

const ESTADOS = {
  probablemente_disponible: { tono: 'bg-verde-claro border-verde-suave', Icon: CircleCheck, iconColor: 'text-verde-suave', titulo: 'Probablemente disponible' },
  riesgo_medio: { tono: 'bg-ambar-suave border-ambar', Icon: TriangleAlert, iconColor: 'text-ambar-texto', titulo: 'Riesgo medio' },
  probablemente_no_disponible: { tono: 'bg-rojo-claro border-rojo', Icon: CircleX, iconColor: 'text-rojo', titulo: 'Probablemente no disponible' },
};

const SUGERENCIAS = ['Zonapp', 'Terreno', 'Mapyme', 'Vecindario', 'Puntocerca'];

export default function VerificarNombrePage() {
  const { token } = useAuth();
  const [nombre, setNombre] = useState('');
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  async function verificar(valor) {
    const nombreAVerificar = (valor ?? nombre).trim();
    if (!nombreAVerificar) return;
    setNombre(nombreAVerificar);
    setError('');
    setCargando(true);
    setResultado(null);
    try {
      const r = await verificarNombre({ nombre: nombreAVerificar }, token);
      setResultado(r);
    } catch (err) {
      setError(err.message || 'No se pudo verificar el nombre.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      <div>
        <div className="font-display font-bold text-lg text-negro mb-1">Verificar nombre</div>
        <div className="text-[13px] text-gris leading-relaxed">
          Estimación con IA de disponibilidad — más los enlaces oficiales para confirmarlo.
        </div>
      </div>

      <Card>
        <div className="text-xs font-medium text-gris mb-2">✏️ Nombre a verificar</div>
        <div className="flex gap-2 mb-3">
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Zonapp, Terreno, Mapyme..." maxLength={40} />
          <Button fullWidth={false} className="px-5" loading={cargando} onClick={() => verificar()}>
            Verificar
          </Button>
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        {resultado && (
          <div className="flex flex-col gap-2.5">
            <BadgeEstimado texto="Estimación con IA — no es verificación oficial" />
            {(() => {
              const cfg = ESTADOS[resultado.estado] || ESTADOS.riesgo_medio;
              const { Icon } = cfg;
              return (
                <div className={`rounded-xl p-3.5 border flex items-start gap-2.5 ${cfg.tono}`}>
                  <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${cfg.iconColor}`} />
                  <div>
                    <div className="text-[13px] font-semibold text-negro mb-1">{cfg.titulo}</div>
                    <div className="text-xs text-gris leading-relaxed">{resultado.razon}</div>
                  </div>
                </div>
              );
            })()}
            <div className="text-[12px] text-gris leading-relaxed">{resultado.advertencia}</div>
            <div className="flex flex-col gap-2 mt-1">
              {Object.values(resultado.enlacesConfirmacion || {})
                .filter((e) => e.url)
                .map((e) => (
                  <a
                    key={e.url}
                    href={e.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[13px] text-verde font-medium hover:underline"
                  >
                    🔗 {e.nombre} →
                  </a>
                ))}
            </div>
          </div>
        )}
      </Card>

      {!resultado && (
        <Card>
          <div className="text-xs font-semibold text-negro mb-2.5">💡 Sugerencias de nombres</div>
          <div className="text-[11px] text-gris mb-2.5">Toca uno para verificarlo:</div>
          <div className="flex flex-wrap gap-1.5">
            {SUGERENCIAS.map((s) => (
              <button
                key={s}
                onClick={() => verificar(s)}
                className="px-3 py-1.5 rounded-full border border-borde text-[12px] text-gris bg-white hover:border-verde-suave transition"
              >
                {s}
              </button>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <div className="text-xs font-semibold text-negro mb-2.5">ℹ️ ¿Qué se verifica?</div>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2.5 items-start">
            <span className="text-xl flex-shrink-0">🏛️</span>
            <div>
              <div className="text-[13px] font-medium text-negro">RUES Colombia</div>
              <div className="text-xs text-gris leading-relaxed">Registro Único Empresarial — razones sociales y nombres comerciales.</div>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="text-xl flex-shrink-0">®️</span>
            <div>
              <div className="text-[13px] font-medium text-negro">SIC — Marcas registradas</div>
              <div className="text-xs text-gris leading-relaxed">Superintendencia de Industria y Comercio — marcas en Colombia.</div>
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="text-xl flex-shrink-0">🌐</span>
            <div>
              <div className="text-[13px] font-medium text-negro">Dominio .co</div>
              <div className="text-xs text-gris leading-relaxed">Dominio colombiano para tu sitio web o app.</div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
