// Formato de números y fechas para pantalla. Un solo lugar, para que los pesos
// se vean igual en toda la app.

const MILES = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

// Pesos colombianos sin decimales: $12.500. Devuelve "—" si no hay número, para
// no pintar "$NaN" ni un 0 que parezca un dato real.
export function formatoCOP(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? `$${MILES.format(Math.round(n))}` : '—';
}

// Igual que arriba pero abreviado, para que un KPI de 7 cifras no rompa la
// tarjeta en un teléfono angosto: $1,3 M · $284 mil · $950.
export function formatoCOPCorto(valor) {
  const n = Number(valor);
  if (!Number.isFinite(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace('.', ',')} M`;
  if (abs >= 10_000) return `$${MILES.format(Math.round(n / 1000))} mil`;
  return `$${MILES.format(Math.round(n))}`;
}

export function formatoNumero(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? MILES.format(n) : '—';
}

// Porcentaje con signo: +12,5% · −6,9% · "—" si no hay con qué comparar.
// El null viene del backend a propósito (no había semana anterior, o no hubo
// órdenes); pintarlo como 0% sería inventar un dato.
export function formatoPorcentaje(valor) {
  const n = Number(valor);
  if (valor === null || valor === undefined || !Number.isFinite(n)) return '—';
  const signo = n > 0 ? '+' : n < 0 ? '−' : '';
  return `${signo}${Math.abs(n).toFixed(1).replace('.', ',')}%`;
}

// Convierte "2026-08-07" en una fecha LOCAL.
//
// Ojo, esto es una trampa clásica: `new Date('2026-08-07')` se interpreta como
// medianoche UTC, que en Colombia (UTC−5) son las 7 p.m. del día ANTERIOR. El
// gráfico quedaría corrido un día. Por eso se parte el texto a mano.
export function fechaLocalDesdeISO(dia) {
  const [anio, mes, dd] = String(dia).split('-').map(Number);
  return new Date(anio, (mes || 1) - 1, dd || 1);
}

// "vie" — etiqueta corta de día para el eje del gráfico.
export function diaCorto(dia) {
  const f = fechaLocalDesdeISO(dia);
  const texto = f.toLocaleDateString('es-CO', { weekday: 'short' });
  return texto.replace('.', '');
}

// "7 ago" — para el detalle de una barra.
export function diaYMes(dia) {
  return fechaLocalDesdeISO(dia)
    .toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
    .replace('.', '');
}

export function esHoy(dia) {
  const hoy = new Date();
  const f = fechaLocalDesdeISO(dia);
  return (
    f.getDate() === hoy.getDate() &&
    f.getMonth() === hoy.getMonth() &&
    f.getFullYear() === hoy.getFullYear()
  );
}

// Hora de una venta: "2:35 p. m.".
//
// Se formatea en la zona del NEGOCIO (la que informa el backend), no en la del
// teléfono. Si no, un usuario viajando vería una venta de las 8 p.m. como si
// hubiera sido a otra hora, y no cuadraría con el "vendido hoy" del dashboard.
export function horaDeVenta(iso, zona = 'America/Bogota') {
  try {
    return new Date(iso).toLocaleTimeString('es-CO', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: zona,
    });
  } catch {
    return '';
  }
}

export function fechaDeVenta(iso, zona = 'America/Bogota') {
  try {
    return new Date(iso)
      .toLocaleDateString('es-CO', { day: 'numeric', month: 'short', timeZone: zona })
      .replace('.', '');
  } catch {
    return '';
  }
}
