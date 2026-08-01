export default function Chip({ children, active = false, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-full border-[1.5px] text-[13px] font-sans transition disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? 'bg-verde border-verde text-white font-medium'
          : 'bg-white border-borde text-gris hover:border-verde-suave'
      }`}
    >
      {children}
    </button>
  );
}
