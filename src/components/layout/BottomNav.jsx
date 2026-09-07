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
    { href: '/', label: 'Inicio', icon: '🏠' },
    { href: '/ventas', label: 'Ventas', icon: '🧾' },
    { href: '/inventario', label: 'Inventario', icon: '📦' },
    { href: '/analizar', label: 'Analizar', icon: '🔍' },
    { href: '/chat', label: 'Asistente', icon: '💬' },
    { href: '/perfil', emoji: '👤', etiqueta: 'Perfil' },
  ];

  export default function BottomNav() {
    const pathname = usePathname();
  
    return (
      <div className="bg-white border-t border-borde flex px-2 py-2 pb-safe">
        {ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl ${
                active ? 'text-verde bg-verde-claro' : 'text-gris'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-semibold mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    );
  }
  