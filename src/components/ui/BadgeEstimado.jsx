import { TriangleAlert } from 'lucide-react';

// Badge de "esto es una estimación de IA, no un dato verificado" — mismo
// patrón en toda la app (fondo ámbar, ícono de alerta, nunca verde) para
// que el usuario nunca confunda una proyección con un dato oficial.
// Ver verificador-nombre-copy.md.
export default function BadgeEstimado({ texto = 'Estimado con IA' }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-ambar-suave text-ambar-texto">
      <TriangleAlert className="h-3 w-3" />
      {texto}
    </span>
  );
}
