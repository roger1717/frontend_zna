import { Sparkles } from 'lucide-react';

// Badge morado que marca todo lo que viene de la IA (estimaciones, el gerente,
// notas generadas). Mismo lenguaje visual del ChipIA del prototipo zonapp-pwa:
// nunca se confunde con el verde de los datos reales.
export default function ChipIA({ texto = 'IA' }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-ia-fondo text-ia">
      <Sparkles size={11} strokeWidth={2.5} />
      {texto}
    </span>
  );
}