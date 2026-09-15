// frontend/src/app/(app)/analizar/resultado/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAnalysis } from '@/context/AnalysisContext';
import ResultadoAnalisisView from '@/components/analisis/ResultadoAnalisisView';

const STORAGE_KEY = 'zonapp_ultimo_analisis';

export default function ResultadoAnalisisPage() {
  const { ultimoAnalisis, contexto, setUltimoAnalisis, setContexto } = useAnalysis();
  const router = useRouter();
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Si ya hay datos en el contexto, mostrarlos
    if (ultimoAnalisis) {
      setCargando(false);
      return;
    }

    // Intentar recuperar de sessionStorage
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setUltimoAnalisis(data.analisis);
          if (data.contexto) setContexto(data.contexto);
          setCargando(false);
          return;
        } catch {
          // ignore
        }
      }
    }

    // Si no hay nada, redirigir al formulario
    router.replace('/analizar');
  }, [ultimoAnalisis, router, setUltimoAnalisis, setContexto]);

  if (cargando) return <div className="p-8 text-center text-gris">Cargando análisis...</div>;
  if (!ultimoAnalisis) return null;

  return <ResultadoAnalisisView analisis={ultimoAnalisis} contexto={contexto} />;
}