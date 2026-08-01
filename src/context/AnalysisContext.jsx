'use client';

import { createContext, useContext, useState } from 'react';

// Puente simple entre la pantalla "Nuevo análisis" (que genera el
// resultado) y "Resultados" (que lo muestra) sin tener que volver a
// pedirlo al backend. Si el usuario refresca la página en /resultado
// perdemos este estado a propósito — no lo persistimos en localStorage
// porque un análisis "fresco" no tiene id todavía (no es historial).
const AnalysisContext = createContext(null);

export function AnalysisProvider({ children }) {
  const [ultimoAnalisis, setUltimoAnalisis] = useState(null);
  const [contexto, setContexto] = useState(null);

  return (
    <AnalysisContext.Provider value={{ ultimoAnalisis, setUltimoAnalisis, contexto, setContexto }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error('useAnalysis debe usarse dentro de <AnalysisProvider>');
  return ctx;
}
