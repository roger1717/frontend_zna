'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { obtenerHistorialDetalle } from '@/lib/api';
import ResultadoAnalisisView from '@/components/analisis/ResultadoAnalisisView';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';

export default function HistorialDetallePage() {
  const { id } = useParams();
  const { token } = useAuth();
  const router = useRouter();
  const [detalle, setDetalle] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerHistorialDetalle(id, token)
      .then(setDetalle)
      .finally(() => setCargando(false));
  }, [id, token]);

  if (cargando) {
    return (
      <div className="py-10">
        <Spinner label="Cargando análisis..." />
      </div>
    );
  }

  if (!detalle) {
    return (
      <div className="text-center py-10">
        <div className="text-[13px] text-gris mb-4">No se pudo cargar este análisis.</div>
        <Button variant="outline" fullWidth={false} onClick={() => router.push('/historial')}>
          ← Volver al historial
        </Button>
      </div>
    );
  }

  return (
    <ResultadoAnalisisView
      analisis={detalle.resultado}
      contexto={{ zona: detalle.zona, sector: detalle.sector, radioMetros: detalle.radio_metros }}
    />
  );
}
