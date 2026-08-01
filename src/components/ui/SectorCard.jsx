export default function SectorCard({ emoji, nombre, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-[1.5px] text-center transition active:scale-[0.96] ${
        active ? 'border-verde bg-verde-claro' : 'border-borde bg-white hover:border-verde-suave'
      }`}
    >
      <span className="text-2xl leading-none">{emoji}</span>
      <span className={`text-[10px] leading-tight font-medium ${active ? 'text-verde font-semibold' : 'text-gris'}`}>
        {nombre}
      </span>
    </button>
  );
}
