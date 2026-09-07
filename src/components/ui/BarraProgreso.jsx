/* frontend/src/components/ui/BarraProgreso.jsx */
const COLOR_POR_DEFECTO = '#1D4E3A';

export default function BarraProgreso({ etiqueta, valor, maximo = 100, color = COLOR_POR_DEFECTO, sufijo = '' }) {
  const porcentaje = Math.min(100, Math.max(0, (valor / maximo) * 100));
  return (
    <div className="mb-2.5 last:mb-0">
      <div className="flex justify-between text-[11px] text-gris mb-1">
        <span>{etiqueta}</span>
        <span className="font-medium text-negro">
          {valor}
          {sufijo}
        </span>
      </div>
      <div className="h-2 bg-borde rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${porcentaje}%`, background: color }}
        />
      </div>
    </div>
  );
}
