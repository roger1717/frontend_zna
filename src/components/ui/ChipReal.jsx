import { BadgeCheck } from 'lucide-react';

// Badge verde que marca lo que son datos reales del negocio (registrados por
// el usuario), igual que el ChipReal del prototipo zonapp-pwa. Complementa a
// ChipIA: nunca se confunde una cifra real con una estimación de IA.
export default function ChipReal({ texto = 'Dato real' }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-verde-claro text-verde flex-shrink-0">
      <BadgeCheck size={11} strokeWidth={2.5} />
      {texto}
    </span>
  );
}
