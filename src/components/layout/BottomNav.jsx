'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Receipt, Package, Search, MessageCircle, User } from 'lucide-react';

// Navegación inferior, siguiendo el patrón de la maqueta original
// (zonapp-pwa): iconos lucide y el ítem activo en verde de marca sobre
// fondo verde-claro con trazo más grueso.
const ITEMS = [
  { href: '/', label: 'Inicio', Icon: Home },
  { href: '/ventas', label: 'Ventas', Icon: Receipt },
  { href: '/inventario', label: 'Inventario', Icon: Package },
  { href: '/analizar', label: 'Analizar', Icon: Search },
  { href: '/chat', label: 'Gerente', Icon: MessageCircle },
  { href: '/perfil', label: 'Perfil', Icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="bg-white border-t border-borde flex px-2 py-2 pb-safe">
      {ITEMS.map(({ href, label, Icon }) => {
        const active =
          pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl ${
              active ? 'text-verde bg-verde-claro' : 'text-gris'
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            <span className="text-[10px] font-semibold mt-0.5">{label}</span>
          </Link>
        );
      })}
    </div>
  );
}