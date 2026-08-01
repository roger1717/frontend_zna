'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Nota: en el diseño original estos 5 espacios eran Inicio/Analizar/
// Tienda Virtual/Verificador/Chat. Tienda Virtual y Chat no existen en
// el backend (ver decisión del usuario), así que esos dos espacios se
// reasignaron a Historial y Perfil — pantallas que en el diseño original
// no tenían ningún botón que llevara a ellas.
const ITEMS = [
  { href: '/', emoji: '🏠', etiqueta: 'Inicio' },
  { href: '/analizar', emoji: '🔍', etiqueta: 'Analizar' },
  { href: '/verificar-nombre', emoji: '🔎', etiqueta: 'Nombre' },
  { href: '/historial', emoji: '📊', etiqueta: 'Historial' },
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
