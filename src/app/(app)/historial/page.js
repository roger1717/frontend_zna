'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { obtenerHistorial } from '@/lib/api';
import { nombreSector, emojiSector } from '@/lib/constants';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';

const POR_PAGINA = 10;

export default function HistorialPage() {
  const { token } = useAuth();
  const [pagina, setPagina] = useState(1);
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    obtenerHistorial({ pagina, porPagina: POR_PAGINA }, token)
      .then(setDatos)
      .finally(() => setCargando(false));
  }, [pagina, token]);

  const totalPaginas = datos ? Math.max(1, Math.ceil(datos.total / POR_PAGINA)) : 1;

  return (
    <>
      <div className="font-display font-bold text-lg text-negro">Mis análisis</div>

      {cargando && <Spinner label="Cargando historial..." />}

      {!cargando && datos?.items?.length === 0 && (
        <EmptyState
          emoji="📊"
          titulo="Aún no tienes análisis"
          descripcion="Haz tu primer análisis y quedará guardado aquí para consultarlo después."
        >
          <Link href="/analizar">
            <Button className="max-w-[220px] mx-auto">🔍 Iniciar análisis</Button>
          </Link>
        </EmptyState>
      )}

      {!cargando && datos?.items?.length > 0 && (
        <>
          <div className="flex flex-col gap-2.5">
            {datos.items.map((item) => (
              <Link key={item.id} href={`/historial/${item.id}`}>
                <Card className="flex items-center gap-3 cursor-pointer hover:border-verde-suave transition">
                  <div className="w-11 h-11 rounded-xl bg-verde flex items-center justify-center text-xl flex-shrink-0">
                    {emojiSector(item.sector)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-negro truncate">{item.zona}</div>
                    <div className="text-[11px] text-gris">
                      {nombreSector(item.sector)} · {new Date(item.created_at).toLocaleDateString('es-CO')}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-bold font-display text-verde leading-none">{item.score ?? '—'}</div>
                    <div className="text-[9px] text-gris mt-0.5">puntaje</div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="flex items-center justify-between mt-1">
              <Button variant="outline" size="sm" fullWidth={false} disabled={pagina <= 1} onClick={() => setPagina((p) => p - 1)}>
                ← Anterior
              </Button>
              <span className="text-[12px] text-gris">
                Página {pagina} de {totalPaginas}
              </span>
              <Button
                variant="outline"
                size="sm"
                fullWidth={false}
                disabled={pagina >= totalPaginas}
                onClick={() => setPagina((p) => p + 1)}
              >
                Siguiente →
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
