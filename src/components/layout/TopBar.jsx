'use client';

import { Sparkles } from 'lucide-react';

// Encabezado siguiendo la marca de la maqueta original: logo "Z" en la
// baldosa ámbar, nombre en Syne, fondo verde degradado y la etiqueta del
// piloto. El plan real del backend en esta fase es "prueba" (único), así
// que no se muestra un selector de plan — solo un indicador BETA.
export default function TopBar() {
  return (
    <header className="bg-gradient-to-br from-verde-oscuro via-verde to-verde-suave px-5 pt-6 pb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-ambar flex items-center justify-center shadow-md shadow-verde-oscuro/30">
          <span className="font-display font-extrabold text-xl text-ambar-texto leading-none">Z</span>
        </div>
        <div className="leading-tight">
          <span className="font-display font-extrabold text-2xl text-white tracking-tight block">
            Zonapp
          </span>
          <span className="text-[10px] font-semibold text-white/60 tracking-wide uppercase">
            Tu negocio al día
          </span>
        </div>
      </div>
      <span className="bg-ambar text-ambar-texto text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
        <Sparkles size={12} strokeWidth={2.5} />
        BETA
      </span>
    </header>
  );
}
