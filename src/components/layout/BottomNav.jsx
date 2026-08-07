'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Nota: en el diseño original estos 5 espacios eran Inicio/Analizar/
// Tienda Virtual/Verificador/Chat. Tienda Virtual y Chat no existen en
// el backend (ver decisión del usuario), así que esos dos espacios se
// reasignaron a Historial y Perfil — pantallas que en el diseño original
// no tenían ningún botón que llevara a ellas.
//
// En la sub-fase 3.6 entró **Ventas** y salió **Historial** (riesgo R6 del plan
// de la Fase 3): seguimos en 5 ítems, que es lo que cabe cómodo en 360 px.
// Ventas se usa varias veces al día; el historial de análisis se consulta una vez
// cada tanto y sigue a un toque desde Inicio ("Mis análisis").
const ITEMS = [
  { href: '/', emoji: '🏠', etiqueta: 'Inicio' },
  { href: '/ventas', emoji: '🧾', etiqueta: 'Ventas' },
  { href: '/inventario', emoji: '📦', etiqueta: 'Inventario' },
  { href: '/analizar', emoji: '🔍', etiqueta: 'Analizar' },
  { href: '/perfil', emoji: '👤', etiqueta: 'Perfil' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div
      className="bg-white border-t border-borde flex flex-shrink-0"
      style={{ padding: '8px 0 calc(8px + var(--safe-bottom))' }}
    >
      {ITEMS.map((item) => {
        const activo = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center gap-0.5 py-1"
          >
            <span className="text-[22px] leading-none">{item.emoji}</span>
            <span className={`text-[10px] ${activo ? 'text-verde font-semibold' : 'text-gris font-medium'}`}>
              {item.etiqueta}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
