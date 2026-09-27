/* frontend/src/components/ui/Alert.jsx */
import { Info, TriangleAlert, CircleAlert } from 'lucide-react';

const TONOS = {
  info: { wrap: 'bg-white border-borde', icon: 'text-gris', Icon: Info },
  warn: { wrap: 'bg-ambar-suave border-ambar', icon: 'text-ambar-texto', Icon: TriangleAlert },
  error: { wrap: 'bg-rojo-claro border-rojo', icon: 'text-rojo', Icon: CircleAlert },
};

export default function Alert({ tone = 'info', children, className = '' }) {
  const { wrap, icon, Icon } = TONOS[tone] || TONOS.info;
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-[13px] leading-relaxed ${wrap} ${className}`}>
      <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${icon}`} />
      <div className="text-negro">{children}</div>
    </div>
  );
}

