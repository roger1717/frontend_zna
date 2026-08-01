import TopBar from './TopBar';
import BottomNav from './BottomNav';

// Mismo "marco de app móvil" del diseño original (tarjeta centrada de
// hasta 480px) — en pantallas grandes queda centrada en vez de estirarse,
// que es la forma en que este tipo de PWA se ve bien en computador sin
// rediseñar nada.
export default function AppShell({ children }) {
  return (
    <div className="h-screen max-w-[480px] mx-auto flex flex-col bg-arena shadow-xl">
      <TopBar />
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 p-4">{children}</div>
      <BottomNav />
    </div>
  );
}
