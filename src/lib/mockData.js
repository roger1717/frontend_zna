// Datos de ejemplo — se muestran SOLO cuando la llamada real al backend
// falla (porque todavía no hay claves reales de Google/Anthropic/Supabase
// configuradas, o el backend no está corriendo). Cada pantalla que usa
// esto lo deja bien marcado con un aviso "Datos de ejemplo" — nunca se
// mezclan con datos reales sin avisar.

export const ANALISIS_EJEMPLO = {
  score: 74,
  resumen:
    'Chapinero Alto tiene buena afluencia peatonal y solo 3 cafeterías bien calificadas en el radio buscado. Es una zona favorable si te diferencias en horario o especialidad.',
  // --- Contrato Fase 1 (Estudio de Mercado): métricas para barras + tips. ---
  // Estimaciones de IA (0-100). Se muestran diferenciadas del dato real.
  metricas: { competencia: 62, densidad: 58, estrato: 60, demanda: 78 },
  tips: [
    'Abre en horario extendido (después de las 8pm): ningún competidor cercano lo cubre.',
    'Comunica el origen del grano en la carta — solo 1 de 3 competidores lo hace.',
    'Habilita mesas con enchufes y buen wifi para la alta demanda de trabajo remoto.',
  ],
  fuente: { competidores: 'mock', ia: 'mock' },
  // --- Campos del informe extendido (fases posteriores; no se usan en Fase 1). ---
  desglose: { competencia: 68, afluencia: 82, accesibilidad: 79 },
  competidores: [
    { nombre: 'Café Cultor', calificacion: 4.5, totalResenas: 312, direccion: 'Cra 13 #54-12' },
    { nombre: 'Azahar Coffee', calificacion: 4.7, totalResenas: 501, direccion: 'Calle 55 #12-30' },
    { nombre: 'Café San Alberto', calificacion: 4.3, totalResenas: 189, direccion: 'Cra 11 #57-08' },
  ],
  oportunidades: [
    { titulo: 'Horario nocturno desatendido', descripcion: 'Ningún competidor cercano abre después de las 8pm.', impacto: 'alto' },
    { titulo: 'Trabajo remoto', descripcion: 'Alta densidad de oficinas y coworks a menos de 300m.', impacto: 'alto' },
    { titulo: 'Café de especialidad', descripcion: 'Solo 1 de 3 competidores promociona origen del grano.', impacto: 'medio' },
  ],
  informe: {
    estrategia: {
      posicionamiento: '"El café de las 6pm" — para quienes salen de la oficina y no encuentran dónde quedarse.',
      pilares: [
        { titulo: '🌙 Horario extendido', descripcion: 'Abrir hasta las 10pm cubre un vacío real que ningún competidor cercano atiende.' },
        { titulo: '💻 Zona de trabajo', descripcion: 'Mesas con enchufes y wifi estable para la alta demanda de trabajo remoto de la zona.' },
        { titulo: '☕ Origen trazable', descripcion: 'Comunicar el origen del grano en la carta — diferenciador frente a la mayoría.' },
      ],
    },
    demanda: {
      proyeccion: [
        { etiqueta: 'Clientes por día', valorInicial: 25, valorMeta: 60 },
        { etiqueta: 'Pedidos para llevar', valorInicial: 10, valorMeta: 30 },
      ],
      ticketPromedio: 'Ticket promedio: $12.000 bebida · $22.000 con acompañamiento',
      ingresosEstimados: [
        { periodo: 'Mes 1', clientesEstimados: '25–35', ingresosEstimados: '$3.5M–$4.8M' },
        { periodo: 'Mes 2', clientesEstimados: '38–50', ingresosEstimados: '$5.2M–$6.8M' },
        { periodo: 'Mes 3', clientesEstimados: '50–65', ingresosEstimados: '$6.8M–$8.9M' },
      ],
    },
    precios: {
      estructura: [
        { item: 'Café americano', precioSugerido: '$6.000–$7.500', margenEstimado: '65–70%' },
        { item: 'Café con leche / latte', precioSugerido: '$9.000–$11.000', margenEstimado: '60–65%' },
        { item: 'Pastelería', precioSugerido: '$7.000–$10.000', margenEstimado: '50–55%' },
        { item: 'Combo bebida + pastelería', precioSugerido: '$15.000–$18.000', margenEstimado: '55%' },
      ],
      comparativoZona: 'En línea con Azahar y Café Cultor; ligeramente por debajo de San Alberto, que se posiciona premium.',
    },
    planTresMeses: [
      {
        mes: 1,
        titulo: 'Lanzamiento',
        meta: '25–35 clientes/día',
        acciones: [
          'Abrir con horario extendido hasta las 10pm desde el día 1.',
          'Google Maps y WhatsApp Business activos antes de abrir.',
          'Wifi y enchufes visibles en la carta y en redes.',
          'Promoción de apertura para oficinas cercanas.',
        ],
      },
      {
        mes: 2,
        titulo: 'Fidelización',
        meta: '15 clientes frecuentes identificados',
        acciones: [
          'Tarjeta de sellos: 6 cafés = 1 gratis.',
          'Contenido en redes sobre el origen del grano.',
          'Alianza con 2 coworks cercanos para descuento a sus miembros.',
          'Meta: 20 reseñas Google 4.5+.',
        ],
      },
      {
        mes: 3,
        titulo: 'Consolidación',
        meta: 'Flujo de caja positivo',
        acciones: [
          'Evaluar ampliar horario si la demanda nocturna se confirma.',
          'Domicilios propios en radio de 500m.',
          'Menú de temporada para renovar interés.',
          'Negociar mejor precio de insumos por volumen.',
        ],
      },
    ],
    riesgos: [
      { titulo: 'Competencia establecida (Azahar)', mitigacion: 'Diferenciarse en horario en vez de competir de frente en especialidad.' },
      { titulo: 'Costo de arriendo en Chapinero Alto', mitigacion: 'Validar punto de equilibrio con el ticket promedio antes de firmar contrato largo.' },
      { titulo: 'Rotación de personal', mitigacion: 'Documentar procesos de preparación desde el mes 1 para facilitar entrenamiento.' },
    ],
  },
};

export const HISTORIAL_EJEMPLO = {
  items: [
    { id: 'demo-1', zona: 'Chapinero Alto, Bogotá', sector: 'cafeteria', radio_metros: 500, score: 74, created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 'demo-2', zona: 'Venecia, Sogamoso', sector: 'restaurante', radio_metros: 1000, score: 61, created_at: new Date(Date.now() - 86400000 * 9).toISOString() },
    { id: 'demo-3', zona: 'Centro, Duitama', sector: 'farmacia', radio_metros: 200, score: 45, created_at: new Date(Date.now() - 86400000 * 20).toISOString() },
  ],
  pagina: 1,
  porPagina: 10,
  total: 3,
};

// Dashboard de Ventas (Fase 3) para el modo de ejemplo: cuando la app corre sin
// claves de Supabase no hay ventas reales que mostrar, pero la pantalla debe
// poderse ver. Va marcado `demo: true` y en pantalla sale el aviso.
//
// Los días se generan al vuelo para que el gráfico siempre termine HOY (con
// fechas fijas se vería un gráfico de la semana pasada).
function ultimosSieteDias() {
  const dias = [];
  const montos = [188000, 142000, 96000, 210000, 175000, 264000, 131000];
  for (let i = 6; i >= 0; i -= 1) {
    const f = new Date();
    f.setDate(f.getDate() - i);
    const iso = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
    dias.push({ dia: iso, ingresos: montos[6 - i], ordenes: Math.round(montos[6 - i] / 15000) });
  }
  return dias;
}

export const DASHBOARD_EJEMPLO = {
  zona_horaria: 'America/Bogota',
  kpis: {
    ventas_hoy: 131000,
    ordenes_hoy: 9,
    utilidad_hoy: 28400,
    unidades_hoy: 21,
    ingresos_semana: 1206000,
    utilidad_semana: 259000,
    ticket_promedio: 14556,
    variacion_vs_ayer_pct: -12.4,
    avance_semanal_pct: 6.8,
  },
  serie_7_dias: ultimosSieteDias(),
  top_productos: [
    { nombre: 'Gaseosa 1.5L', unidades: 14, ingresos: 77000 },
    { nombre: 'Leche 1L', unidades: 12, ingresos: 52800 },
    { nombre: 'Pan tajado', unidades: 9, ingresos: 45000 },
  ],
};

export const VERIFICACION_NOMBRE_EJEMPLO = {
  estimado: true,
  estado: 'probablemente_disponible',
  razon: 'Es un nombre poco genérico y no coincide con marcas comunes del sector.',
  advertencia:
    'Estimación con IA — no es una verificación oficial. Confírmalo directamente antes de registrar tu negocio.',
  enlacesConfirmacion: {
    rues: { nombre: 'Registro mercantil (RUES)', url: 'https://www.rues.org.co' },
    sic: { nombre: 'Marcas registradas (SIC)', url: 'https://www.sic.gov.co' },
    dominio: { nombre: 'Disponibilidad de dominio .co', url: null },
  },
};
