import {
  ANALISIS_EJEMPLO,
  HISTORIAL_EJEMPLO,
  SEGUIMIENTO_EJEMPLO,
  VERIFICACION_NOMBRE_EJEMPLO,
} from './mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
    throw new ApiError(datos.error || 'Ocurrió un error inesperado.', respuesta.status);
  }
  return datos;
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
    // Los errores de validación (400) y de límite de plan (403) SÍ deben
    // mostrarse al usuario tal cual — no tiene sentido taparlos con un
    // ejemplo. Solo caemos a demo cuando el problema es de conexión o de
    // claves externas todavía no configuradas (502/0).
    if (err.status === 400 || err.status === 403) throw err;
    return { ...ANALISIS_EJEMPLO, demo: true };
  }
}

export async function verificarNombre(payload, token) {
  try {
    const resultado = await apiFetch('/api/verificar-nombre', { method: 'POST', body: payload, token });
    return { ...resultado, demo: false };
  } catch (err) {
    if (err.status === 400) throw err;
    return { ...VERIFICACION_NOMBRE_EJEMPLO, demo: true };
  }
}

export async function obtenerHistorial({ pagina = 1, porPagina = 10 } = {}, token) {
  try {
    const resultado = await apiFetch(`/api/historial?pagina=${pagina}&porPagina=${porPagina}`, { token });
    return { ...resultado, demo: false };
  } catch {
    return { ...HISTORIAL_EJEMPLO, demo: true };
  }
}

export async function obtenerHistorialDetalle(id, token) {
  try {
    const resultado = await apiFetch(`/api/historial/${id}`, { token });
    return { ...resultado, demo: false };
  } catch {
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

// Seguimiento diario es exclusivo Pro/Equipo (ver config/planes.js del
// backend). Si el backend responde 403, es una regla de negocio real —
// se muestra tal cual, no se tapa con datos de ejemplo. En modo demo no
// hay sesión real, así que el backend responde 401 antes de llegar a
// revisar el plan — eso SÍ cae a datos de ejemplo, dejando el módulo
// abierto para probarlo sin necesidad de una cuenta Pro real.
export async function obtenerResumenSeguimiento(token) {
  try {
    const resultado = await apiFetch('/api/seguimiento/resumen', { token });
    return { ...resultado, demo: false };
  } catch (err) {
    if (err.status === 403) throw err;
    return { ...SEGUIMIENTO_EJEMPLO, demo: true };
  }
}

export async function registrarSeguimiento(payload, token) {
  try {
    await apiFetch('/api/seguimiento', { method: 'POST', body: payload, token });
    return { demo: false };
  } catch (err) {
    if (err.status === 400 || err.status === 403) throw err;
    return { demo: true };
  }
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
