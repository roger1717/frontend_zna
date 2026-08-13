import {
  ANALISIS_EJEMPLO,
  DASHBOARD_EJEMPLO,
  HISTORIAL_EJEMPLO,
  VERIFICACION_NOMBRE_EJEMPLO,
} from './mockData';
import {
  demoListar,
  demoCrear,
  demoEditar,
  demoBorrar,
  demoAuditoria,
} from './inventarioDemo';
import { supabaseConfigurado } from './supabaseClient';
import { permiteDatosDeEjemplo } from './erroresApi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Aviso de "tu sesión se venció". Lo escucha AuthContext, que limpia la sesión;
// el layout de (app) ve que ya no hay usuario y manda al login. Se hace con un
// evento para no acoplar esta capa (llamadas HTTP) con la de sesión.
export const EVENTO_SESION_VENCIDA = 'zonapp:sesion-vencida';

function avisarSesionVencida() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(EVENTO_SESION_VENCIDA));
  }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function apiFetch(ruta, { method = 'GET', body, token } = {}) {
  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // El backend no respondió — ni siquiera hay conexión (ej. no está
    // corriendo, o no hay internet). Se trata igual que un error de la API.
    throw new ApiError('No se pudo conectar con el servidor.', 0);
  }

  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    // Con Supabase configurado, un 401 solo puede significar una cosa: el token
    // venció o dejó de existir. Hay que volver a entrar.
    if (respuesta.status === 401 && supabaseConfigurado) avisarSesionVencida();
    throw new ApiError(datos.error || 'Ocurrió un error inesperado.', respuesta.status);
  }
  return datos;
}

// La regla vive en lib/erroresApi.js (pura y probada aparte). Aquí solo se le
// conecta el contexto: el error que llegó y si la app tiene Supabase de verdad.
// Ver el hallazgo A1 de docs/research/preparacion-movil-fases-1-3.md.
function esErrorSinBackend(err) {
  if (!(err instanceof ApiError)) return false;
  return permiteDatosDeEjemplo(err.status, supabaseConfigurado);
}

// --- Cada función intenta la llamada REAL primero. Si el backend no
// puede completarla (porque las claves de Google/Anthropic/Wompi todavía
// son de prueba, o el backend no está corriendo), cae a datos de ejemplo
// y lo marca con `demo: true` para que la pantalla lo avise honestamente
// — nunca se muestra un dato simulado como si fuera real. ---

export async function analizarZona(payload, token) {
  try {
    const resultado = await apiFetch('/api/analizar', { method: 'POST', body: payload, token });
    // El backend ya informa si el resultado usó datos reales o de ejemplo
    // (campo `demo` + `fuente`). Lo respetamos tal cual — no lo forzamos a
    // false — para no presentar un mock como si fuera real.
    return { demo: false, ...resultado };
  } catch (err) {
    // Solo se muestra un análisis de ejemplo cuando no había forma de conseguir
    // el real: sin conexión, sin base de datos, o falló el servicio externo (502).
    // Un 400 (datos inválidos), un 403 (límite del plan) y un 401 (sesión
    // vencida) se muestran tal cual: son cosas que el usuario debe saber.
    if (esErrorSinBackend(err) || err.status === 502) return { ...ANALISIS_EJEMPLO, demo: true };
    throw err;
  }
}

export async function verificarNombre(payload, token) {
  try {
    const resultado = await apiFetch('/api/verificar-nombre', { method: 'POST', body: payload, token });
    return { ...resultado, demo: false };
  } catch (err) {
    if (esErrorSinBackend(err) || err.status === 502) return { ...VERIFICACION_NOMBRE_EJEMPLO, demo: true };
    throw err;
  }
}

export async function obtenerHistorial({ pagina = 1, porPagina = 10 } = {}, token) {
  try {
    const resultado = await apiFetch(`/api/historial?pagina=${pagina}&porPagina=${porPagina}`, { token });
    return { ...resultado, demo: false };
  } catch (err) {
    if (esErrorSinBackend(err)) return { ...HISTORIAL_EJEMPLO, demo: true };
    // Sesión vencida u otro error: lista vacía, nunca análisis inventados.
    return { items: [], pagina, porPagina, total: 0, demo: false };
  }
}

export async function obtenerHistorialDetalle(id, token) {
  try {
    const resultado = await apiFetch(`/api/historial/${id}`, { token });
    return { ...resultado, demo: false };
  } catch (err) {
    if (!esErrorSinBackend(err)) return null;
    return {
      id,
      zona: 'Chapinero Alto, Bogotá',
      sector: 'cafeteria',
      radio_metros: 500,
      resultado: ANALISIS_EJEMPLO,
      demo: true,
    };
  }
}

// Nota: aquí vivían `obtenerResumenSeguimiento` y `registrarSeguimiento`. Se
// borraron en la sub-fase 3.6: llamaban a `/api/seguimiento`, endpoints que el
// backend nunca implementó, así que esa pantalla siempre mostraba datos de
// ejemplo. Su función la cumple ahora `/ventas` con datos reales (decisión D7 en
// docs/research/plan-3-dashboard-ventas.md).

// --- Perfil del usuario autenticado (Fase 2) ---
export async function obtenerPerfil(token) {
  try {
    const resultado = await apiFetch('/api/perfil', { token });
    return { ...resultado, demo: false };
  } catch {
    return { perfil: null, demo: true };
  }
}

// --- Inventario (Fase 2) ---
// Requiere sesión real + Supabase. Sin ellos (modo demo / sin backend), cae a un
// store local (inventarioDemo) para que la pantalla sea usable, marcado como demo.
// Los errores de validación (400) SÍ se propagan para mostrarse al usuario.

export async function listarProductos(token) {
  try {
    const { productos } = await apiFetch('/api/inventario', { token });
    return { productos, demo: false };
  } catch (err) {
    if (esErrorSinBackend(err)) return { productos: demoListar(), demo: true };
    throw err;
  }
}

export async function crearProducto(payload, token) {
  try {
    const { producto } = await apiFetch('/api/inventario', { method: 'POST', body: payload, token });
    return { producto, demo: false };
  } catch (err) {
    if (err instanceof ApiError && err.status === 400) throw err;
    if (esErrorSinBackend(err)) return { producto: demoCrear(payload), demo: true };
    throw err;
  }
}

export async function editarProducto(id, payload, token) {
  try {
    const { producto } = await apiFetch(`/api/inventario/${id}`, { method: 'PATCH', body: payload, token });
    return { producto, demo: false };
  } catch (err) {
    if (err instanceof ApiError && (err.status === 400 || err.status === 404)) throw err;
    if (esErrorSinBackend(err)) return { producto: demoEditar(id, payload), demo: true };
    throw err;
  }
}

export async function borrarProducto(id, token) {
  try {
    await apiFetch(`/api/inventario/${id}`, { method: 'DELETE', token });
    return { demo: false };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) throw err;
    if (esErrorSinBackend(err)) {
      demoBorrar(id);
      return { demo: true };
    }
    throw err;
  }
}

export async function auditarInventario(token) {
  try {
    const resultado = await apiFetch('/api/inventario/auditoria', { method: 'POST', token });
    return { ...resultado, demo: resultado.demo ?? false };
  } catch (err) {
    if (esErrorSinBackend(err)) return demoAuditoria();
    throw err;
  }
}

// --- Ventas y Dashboard (Fase 3) ---
//
// Estas necesitan cuenta real: una venta descuenta stock de verdad. En modo de
// ejemplo (sin claves de Supabase) el dashboard SÍ se puede ver —marcado como
// ejemplo— pero registrar y anular se rechazan con un mensaje claro. Fingir que
// se guardó una venta que no se guardó sería justo lo contrario de la regla de
// honestidad de datos.

const SOLO_CON_CUENTA = 'Para registrar ventas necesitas una cuenta real (modo de ejemplo activo).';

export async function obtenerDashboard(token) {
  try {
    const resultado = await apiFetch('/api/dashboard', { token });
    return { ...resultado, demo: false };
  } catch (err) {
    if (esErrorSinBackend(err)) return { ...DASHBOARD_EJEMPLO, demo: true };
    throw err;
  }
}

export async function listarVentas(token) {
  try {
    const { ventas } = await apiFetch('/api/ventas', { token });
    return { ventas: ventas || [], demo: false };
  } catch (err) {
    if (esErrorSinBackend(err)) return { ventas: [], demo: true };
    throw err;
  }
}

export async function registrarVenta(payload, token) {
  try {
    const { venta } = await apiFetch('/api/ventas', { method: 'POST', body: payload, token });
    return { venta, demo: false };
  } catch (err) {
    if (esErrorSinBackend(err)) throw new ApiError(SOLO_CON_CUENTA, 0);
    throw err;
  }
}

export async function corregirVenta(id, payload, token) {
  try {
    const { venta } = await apiFetch(`/api/ventas/${id}`, { method: 'PUT', body: payload, token });
    return { venta, demo: false };
  } catch (err) {
    if (esErrorSinBackend(err)) throw new ApiError(SOLO_CON_CUENTA, 0);
    throw err;
  }
}

export async function anularVenta(id, token) {
  try {
    await apiFetch(`/api/ventas/${id}`, { method: 'DELETE', token });
    return { demo: false };
  } catch (err) {
    if (esErrorSinBackend(err)) throw new ApiError(SOLO_CON_CUENTA, 0);
    throw err;
  }
}

// --- Chatbot (Fase 4) ---
// A diferencia de las demás, NO cae a datos de ejemplo: una respuesta de
// asistente inventada sería justo lo contrario de la regla de honestidad. Si
// algo falla, se propaga el ApiError y la pantalla muestra el problema tal cual
// (sin conexión, sesión vencida, límite alcanzado, etc.).
export async function enviarMensajeChatbot(mensaje, token) {
  return apiFetch('/api/chatbot/mensajes', { method: 'POST', body: { mensaje }, token });
}

export async function iniciarPago(plan, token) {
  try {
    const resultado = await apiFetch('/api/pago/iniciar', { method: 'POST', body: { plan }, token });
    return { ...resultado, demo: false };
  } catch {
    // No hay un checkout de mentira que tenga sentido mostrar — el
    // widget de Wompi necesita una llave pública real. Simplemente
    // avisamos que todavía no está conectado.
    throw new ApiError('Los pagos todavía no están conectados (falta configurar Wompi).', 0);
  }
}
