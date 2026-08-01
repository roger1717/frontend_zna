export default function Card({ children, className = '', style }) {
  return (
    <div
      className={`bg-white rounded-2xl p-4 border border-borde ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
