export default function EmptyState({ emoji = '📊', titulo, descripcion, children }) {
  return (
    <div className="text-center py-10 px-4">
      <div className="text-4xl mb-3">{emoji}</div>
      <div className="text-[15px] font-semibold text-negro mb-1.5">{titulo}</div>
      {descripcion && <div className="text-[13px] text-gris mb-5 leading-relaxed max-w-xs mx-auto">{descripcion}</div>}
      {children}
    </div>
  );
}
