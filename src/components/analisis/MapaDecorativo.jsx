// Representación visual estilizada (NO un mapa real ni geográficamente
// preciso) — mismo patrón decorativo del diseño original: un fondo verde
// con cuadrícula, un círculo punteado para la zona, y puntos para los
// competidores encontrados. Sirve para dar contexto visual rápido, no
// para navegar ni medir distancias reales.
const POSICIONES = [
  { top: 32, left: 50 },
  { top: 85, left: 25 },
  { top: 22, left: 148 },
  { top: 112, left: 155 },
  { top: 58, left: 220 },
];

export default function MapaDecorativo({ competidores = [], radioEtiqueta }) {
  return (
    <div className="bg-verde rounded-2xl h-40 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div
        className="absolute border-[1.5px] border-dashed border-ambar rounded-full animate-pulse"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 110, height: 90 }}
      />
      {competidores.slice(0, 5).map((c, i) => {
        const p = POSICIONES[i] || { top: 50 + i * 18, left: 55 + i * 28 };
        return (
          <div key={i} className="absolute flex flex-col items-center gap-0.5" style={{ top: p.top, left: p.left }}>
            <div className="w-2.5 h-2.5 rounded-full border-2 border-white bg-ambar" />
            <div className="text-[8px] text-white bg-black/60 px-1 py-0.5 rounded whitespace-nowrap">
              {(c.nombre || '').slice(0, 14)}
            </div>
          </div>
        );
      })}
      <div className="absolute flex flex-col items-center gap-0.5" style={{ top: 72, left: 108 }}>
        <div className="w-3.5 h-3.5 rounded-full border-[2.5px] border-white bg-teal" />
        <div className="text-[8px] text-white bg-verde px-1 py-0.5 rounded">Tu negocio</div>
      </div>
      <div className="absolute bottom-2 left-2.5 flex gap-2.5">
        <div className="flex items-center gap-1 text-[9px] text-white/80">
          <span className="w-1.5 h-1.5 rounded-full border border-white/60 bg-ambar" /> Competidores
        </div>
        <div className="flex items-center gap-1 text-[9px] text-white/80">
          <span className="w-1.5 h-1.5 rounded-full border border-white/60 bg-teal" /> Tu negocio
        </div>
      </div>
      {radioEtiqueta && (
        <div className="absolute bottom-2 right-2.5 bg-white/15 rounded px-2 py-0.5 text-[9px] text-white/90">
          Radio {radioEtiqueta}
        </div>
      )}
    </div>
  );
}
