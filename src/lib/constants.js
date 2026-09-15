// Espejo del backend — src/services/googlePlaces.js (SECTORES_VALIDOS),
// src/config/planes.js (RADIOS/PLANES). El backend es la fuente de verdad.

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

export const CATEGORIAS_GASTO = [
  { id: 'arriendo', nombre: 'Arriendo' },
  { id: 'servicios_publicos', nombre: 'Servicios públicos' },
  { id: 'insumos', nombre: 'Insumos' },
  { id: 'transporte', nombre: 'Transporte' },
  { id: 'nomina', nombre: 'Nómina' },
  { id: 'otro', nombre: 'Otro' },
];

export function nombreSector(id) {
  return SECTORES.find((s) => s.id === id)?.nombre ?? id;
}

export function emojiSector(id) {
  return SECTORES.find((s) => s.id === id)?.emoji ?? '🏪';
}

// Plan de prueba: radio máximo 200 m (el backend rechaza más).
export const RADIOS = [{ metros: 200, etiqueta: '200 m' }];

export const RADIO_PRUEBA_METROS = 200;
/** @deprecated usar RADIO_PRUEBA_METROS */
export const RADIO_GRATIS_METROS = RADIO_PRUEBA_METROS;

export const LIMITE_ANALISIS_PRUEBA = 1;
export const LIMITE_PRODUCTOS_PRUEBA = 5;
export const LIMITE_SERVICIOS_PRUEBA = 1;
/** @deprecated usar LIMITE_ANALISIS_PRUEBA */
export const LIMITE_ANALISIS_GRATIS_MES = LIMITE_ANALISIS_PRUEBA;

// Espejo de backend/src/config/planes.js — piloto: un solo plan.
export const PLANES = [
  {
    id: 'prueba',
    nombre: 'Prueba',
    precio: '$0',
    periodo: '',
    descripcion: 'Plan de prueba del piloto',
    caracteristicas: [
      '1 análisis de zona',
      'Hasta 5 productos',
      '1 servicio',
      'Radio máximo 200 m',
    ],
    destacado: true,
  },
];

// Nicho libre: cuando el usuario no encuentra su negocio en la lista, escribe
// su propio nicho y se envía como sector: SECTOR_PERSONALIZADO + nicho_personalizado.
export const SECTOR_PERSONALIZADO = 'personalizado';
