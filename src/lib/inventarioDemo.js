// Store de inventario en "modo demo" (sin Supabase configurado o sin sesión
// real). Guarda en localStorage para que la pantalla de Inventario sea
// usable y previsualizable sin backend — igual que el resto de la app.
// SIEMPRE se marca como demo en la UI: nunca se presenta como dato real.

const CLAVE = 'zonapp_demo_inventario';

const SEMILLA = [
  { nombre: 'Arepa de maíz', stock_actual: 8, stock_minimo: 10, precio: 2500, costo: 1200 },
  { nombre: 'Gaseosa personal', stock_actual: 0, stock_minimo: 6, precio: 3000, costo: 2100 },
  { nombre: 'Café en grano (kg)', stock_actual: 40, stock_minimo: 5, precio: 28000, costo: 18000 },
];

function ahora() {
  return new Date().toISOString();
}

function leer() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem(CLAVE) || 'null');
  } catch {
    return null;
  }
}

function guardar(productos) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CLAVE, JSON.stringify(productos));
}

function inicializar() {
  let productos = leer();
  if (!productos) {
    productos = SEMILLA.map((p, i) => ({
      id: `demo-${i}-${Date.now()}`,
      ...p,
      created_at: ahora(),
      updated_at: ahora(),
    }));
    guardar(productos);
  }
  return productos;
}

export function demoListar() {
  return inicializar();
}

export function demoCrear(datos) {
  const productos = inicializar();
  const nuevo = {
    id: `demo-${Date.now()}`,
    nombre: datos.nombre,
    stock_actual: Number(datos.stock_actual) || 0,
    stock_minimo: Number(datos.stock_minimo) || 0,
    precio: Number(datos.precio) || 0,
    costo: Number(datos.costo) || 0,
    created_at: ahora(),
    updated_at: ahora(),
  };
  const actualizado = [nuevo, ...productos];
  guardar(actualizado);
  return nuevo;
}

export function demoEditar(id, datos) {
  const productos = inicializar();
  let editado = null;
  const actualizado = productos.map((p) => {
    if (p.id !== id) return p;
    editado = { ...p, ...datos, updated_at: ahora() };
    return editado;
  });
  guardar(actualizado);
  return editado;
}

export function demoBorrar(id) {
  const productos = inicializar();
  guardar(productos.filter((p) => p.id !== id));
}

// Auditoría demo: misma lógica determinística del mock del backend
// (services/llm/auditoria.js) para que el modo demo se vea coherente.
export function demoAuditoria() {
  const productos = inicializar();
  if (productos.length === 0) {
    return { resumen: 'Aún no tienes productos. Agrega algunos para recibir una auditoría.', alertas: [], estrategias: [], demo: true };
  }

  const alertas = productos
    .filter((p) => p.stock_actual <= p.stock_minimo)
    .slice(0, 6)
    .map((p) => ({
      producto: p.nombre,
      motivo:
        p.stock_actual === 0
          ? 'Sin stock: se agotó y podrías estar perdiendo ventas.'
          : `Stock bajo (${p.stock_actual}), igual o por debajo de tu mínimo (${p.stock_minimo}).`,
      severidad: p.stock_actual === 0 ? 'alta' : 'media',
    }));

  const estrategias = [];
  const margenBajo = productos.find((p) => p.precio > 0 && p.precio - p.costo <= p.costo * 0.1);
  if (margenBajo) {
    estrategias.push({
      titulo: 'Margen muy bajo',
      detalle: `"${margenBajo.nombre}" deja poca ganancia. Revisa el precio o busca un proveedor más barato.`,
    });
  }
  const estancado = productos.find((p) => p.stock_minimo > 0 && p.stock_actual > p.stock_minimo * 4);
  if (estancado) {
    estrategias.push({
      titulo: 'Capital estancado',
      detalle: `Tienes mucho "${estancado.nombre}" en bodega. Podría ser dinero quieto; considera una promoción para rotarlo.`,
    });
  }

  return {
    resumen: `Tienes ${productos.length} producto(s). ${alertas.length} en riesgo de agotarse.`,
    alertas,
    estrategias: estrategias.slice(0, 4),
    demo: true,
  };
}
