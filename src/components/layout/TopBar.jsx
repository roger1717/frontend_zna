'use client';

import { useAuth } from '@/context/AuthContext';

const ETIQUETA_PLAN = {
  gratis: 'GRATIS',
  informe: 'INFORME',
  pro_individual: 'PRO',
  equipo: 'EQUIPO',
};

export default function TopBar() {
  const { user, modoDemo } = useAuth();
  const etiqueta = modoDemo ? 'DEMO' : ETIQUETA_PLAN[user?.plan] || 'BETA';

  return (
    <div className="bg-verde px-[18px] pt-[calc(14px+var(--safe-top))] pb-3.5 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-2 font-display font-extrabold text-xl text-white tracking-tight">
        <div className="w-7 h-7 rounded-[7px] bg-ambar flex items-center justify-center text-sm font-black text-ambar-texto font-display">
          Z
        </div>
        Zonapp
      </div>
      <div className="bg-ambar text-ambar-texto text-[10px] font-bold px-2 py-1 rounded-full">{etiqueta}</div>
    </div>
  );
}
