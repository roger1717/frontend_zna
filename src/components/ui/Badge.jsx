const TONOS = {
  verde: 'bg-verde-claro2 text-verde-suave',
  ambar: 'bg-ambar-suave text-ambar-texto',
  azul: 'bg-azul-claro text-azul-oscuro',
  rojo: 'bg-rojo-claro text-rojo',
  neutro: 'bg-arena text-gris',
};

export default function Badge({ children, tone = 'neutro', className = '' }) {
  return (
    <span
      className={`inline-flex items-center text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${TONOS[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
