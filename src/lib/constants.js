// Espejo del backend — src/services/googlePlaces.js (SECTORES_VALIDOS),
// src/config/planes.js (RADIOS/PLANES). Si el backend cambia esta lista,
// hay que actualizar esto también; lo dejamos así (en vez de pedirle la
// lista al backend en cada carga) porque son datos que casi no cambian
// y así la pantalla de "Nuevo análisis" no depende de una llamada extra.

// archivo src/lib/constants.js
export const SECTORES = [
  { id: 'tienda_barrio', emoji: '🛒', nombre: 'Tienda de barrio' },
  { id: 'restaurante', emoji: '🍽️', nombre: 'Restaurante' },
  { id: 'panaderia', emoji: '🥖', nombre: 'Panadería' },
  { id: 'peluqueria', emoji: '💇', nombre: 'Peluquería' },
  { id: 'farmacia', emoji: '💊', nombre: 'Farmacia' },
  { id: 'ferreteria', emoji: '🔨', nombre: 'Ferretería' },
  { id: 'ropa_boutique', emoji: '👕', nombre: 'Ropa / Boutique' },
  { id: 'cafeteria', emoji: '☕', nombre: 'Cafetería' },
  { id: 'gimnasio', emoji: '💪', nombre: 'Gimnasio' },
  { id: 'veterinaria', emoji: '🐾', nombre: 'Veterinaria' },
  { id: 'lavanderia', emoji: '👔', nombre: 'Lavandería' },
  { id: 'licorera', emoji: '🍷', nombre: 'Licorera' },
  { id: 'tecnologia_celulares', emoji: '📱', nombre: 'Tecnología / Celulares' },
];

export function nombreSector(id) {
  return SECTORES.find((s) => s.id === id)?.nombre ?? id;
}

export function emojiSector(id) {
  return SECTORES.find((s) => s.id === id)?.emoji ?? '🏪';
}

// Radios seleccionables por el usuario (planes pagos). El plan Gratis
// siempre usa 200m fijo — eso lo decide el backend, no se ofrece como
// opción aquí (ver RADIO_GRATIS_METROS).
export const RADIOS = [
  { metros: 500, etiqueta: '500 m' },
  { metros: 1000, etiqueta: '1 km' },
  { metros: 2000, etiqueta: '2 km' },
  { metros: 5000, etiqueta: '5 km' },
];

export const RADIO_GRATIS_METROS = 200;
export const LIMITE_ANALISIS_GRATIS_MES = 2;

// Precios — deben coincidir con src/config/planes.js del backend. El
// backend es quien de verdad calcula el monto a cobrar (nunca el
// frontend); esto es solo para mostrar la tabla de precios.
export const PLANES = [
  {
    id: 'gratis',
    nombre: 'Gratis',
    precio: '$0',
    periodo: '',
    descripcion: 'Para evaluar antes de decidir',
    caracteristicas: ['2 análisis por mes', 'Radio fijo de 200 m', 'Solo puntaje general'],
    destacado: false,
  },
  {
    id: 'informe',
    nombre: 'Informe',
    precio: '$12.900',
    periodo: 'pago único',
    descripcion: 'Un análisis completo, una sola vez',
    caracteristicas: [
      'Análisis completo (puntaje, oportunidades, informe detallado)',
      'Verificador de nombre',
      'Sin suscripción',
    ],
    destacado: false,
  },
  {
    id: 'pro_individual',
    nombre: 'Pro individual',
    precio: '$39.900',
    periodo: '/mes',
    descripcion: 'Para quien ya decidió o ya abrió',
    caracteristicas: [
      'Análisis completos sin límite',
      'Informe detallado siempre',
      'Historial completo en la nube',
    ],
    destacado: true,
  },
  {
    id: 'equipo',
    nombre: 'Equipo',
    precio: '$89.900',
    periodo: '/mes',
    descripcion: 'Todo Pro + tu equipo de trabajo',
    caracteristicas: ['Todo lo de Pro individual', 'Hasta 3 usuarios de tu equipo'],
    destacado: false,
  },
];
