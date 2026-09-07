/* frontend/src/components/ui/Spinner.jsx */
import { Loader2 } from 'lucide-react';

export default function Spinner({ className = 'h-5 w-5', label }) {
  return (
    <div className="flex items-center justify-center gap-2 text-gris">
      <Loader2 className={`animate-spin text-verde ${className}`} />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
