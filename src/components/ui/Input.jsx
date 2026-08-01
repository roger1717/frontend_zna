export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-gris">{label}</label>}
      <input
        className={`w-full px-4 py-3 rounded-xl border-[1.5px] border-borde bg-white text-[15px] text-negro outline-none transition focus:border-verde ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rojo">{error}</span>}
    </div>
  );
}
