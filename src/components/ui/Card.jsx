/* frontend/src/components/ui/Card.jsx */
export default function Card({ children, className = '', style }) {
  return (
    <div
      className={`bg-white rounded-2xl p-4 border border-borde shadow-sm ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}