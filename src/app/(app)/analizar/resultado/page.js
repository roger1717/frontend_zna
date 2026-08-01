'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAnalysis } from '@/context/AnalysisContext';
import ResultadoAnalisisView from '@/components/analisis/ResultadoAnalisisView';

export default function ResultadoAnalisisPage() {
  const { ultimoAnalisis, contexto } = useAnalysis();
  const router = useRouter();

  useEffect(() => {
    // Si se llega acá directo (ej. refrescando la página) no tenemos el
    // resultado en memoria — no se puede volver a pedir sin repetir el
    // formulario, así que mandamos de vuelta a "Nuevo análisis".
    if (!ultimoAnalisis) router.replace('/analizar');
  }, [ultimoAnalisis, router]);

  if (!ultimoAnalisis) return null;

  return <ResultadoAnalisisView analisis={ultimoAnalisis} contexto={contexto} demo={ultimoAnalisis.demo} />;
}
