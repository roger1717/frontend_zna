// frontend/src/context/AnalysisContext.jsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'zonapp_ultimo_analisis';

const AnalysisContext = createContext(null);

export function AnalysisProvider({ children }) {
  // Inicializar desde sessionStorage si existe
  const [ultimoAnalisis, setUltimoAnalisis] = useState(null);
  const [contexto, setContexto] = useState(null);

  // Al cargar el componente, recuperar datos guardados
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setUltimoAnalisis(data.analisis || null);
        setContexto(data.contexto || null);
      } catch {
        // ignore
      }
    }
  }, []);

  // Función para guardar el análisis (sobrescribe la que viene por defecto)
  const guardarAnalisis = (analisis, ctx) => {
    setUltimoAnalisis(analisis);
    setContexto(ctx || null);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ analisis, contexto: ctx || null }));
    }
  };

  // Función para limpiar (útil al iniciar un nuevo análisis)
  const limpiarAnalisis = () => {
    setUltimoAnalisis(null);
    setContexto(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <AnalysisContext.Provider
      value={{
        ultimoAnalisis,
        contexto,
        setUltimoAnalisis: guardarAnalisis, // reemplazamos la función original
        setContexto, // lo dejamos pero lo usaremos internamente
        limpiarAnalisis, // añadimos esta función
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error('useAnalysis debe usarse dentro de <AnalysisProvider>');
  return ctx;
}