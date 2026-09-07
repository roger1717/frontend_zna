'use client';

import { useAuth } from '@/context/AuthContext';

const ETIQUETA_PLAN = {
  gratis: 'GRATIS',
  informe: 'INFORME',
  pro_individual: 'PRO',
  equipo: 'EQUIPO',
};

export default function TopBar() {
  return (
    <div className="bg-verde px-5 pt-6 pb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-ambar flex items-center justify-center font-display font-extrabold text-xl text-ambar-texto">
          Z
        </div>
        <span className="font-display font-extrabold text-2xl text-white tracking-tight">
          Zonapp
        </span>
      </div>
      <span className="bg-ambar text-ambar-texto text-[10px] font-bold px-3 py-1 rounded-full">
        BETA
      </span>
    </div>
  );
}