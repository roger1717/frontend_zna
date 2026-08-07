import Card from '@/components/ui/Card';
import { formatoCOP, formatoNumero } from '@/lib/formato';

const MEDALLAS = ['🥇', '🥈', '🥉'];

// Los 3 productos que más se movieron en la semana, ordenados por UNIDADES (no
// por plata): al tendero le sirve para saber qué reponer, y lo que se agota es lo
// que sale en cantidad, no lo que factura más.
export default function TopProductos({ productos = [] }) {
  if (productos.length === 0) return null;

  return (
    <Card>
      <div className="text-[13px] font-semibold text-negro mb-0.5">Lo que más se vendió</div>
      <div className="text-[11px] text-gris mb-3">Por unidades, en los últimos 7 días</div>

      <div className="flex flex-col gap-2.5">
        {productos.map((p, i) => (
          <div key={p.nombre} className="flex items-center gap-3">
            <span className="text-lg leading-none w-6 text-center flex-shrink-0">{MEDALLAS[i] || '•'}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-negro truncate">{p.nombre}</div>
              <div className="text-[11px] text-gris">{formatoNumero(p.unidades)} unidades</div>
            </div>
            <span className="text-[13px] font-semibold text-negro flex-shrink-0">
              {formatoCOP(p.ingresos)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
