

/* frontend/src/lib/api.js */

import { supabaseConfigurado } from './supabaseClient';
import { permiteDatosDeEjemplo } from './erroresApi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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
    throw new ApiError('No se pudo conectar con el servidor.', 0);
  }

  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    if (respuesta.status === 401 && supabaseConfigurado) avisarSesionVencida();
    throw new ApiError(datos.error || 'Ocurrió un error inesperado.', respuesta.status);
  }
  return datos;
}

function esErrorSinBackend(err) {
  if (!(err instanceof ApiError)) return false;
  return permiteDatosDeEjemplo(err.status, supabaseConfigurado);
}

const SOLO_CON_CUENTA = 'Para realizar esta acción necesitas una cuenta real activa.';

// --- Perfil ---
export async function obtenerPerfil(token) {
  try {
    const resultado = await apiFetch('/api/perfil', { token });
    return { ...resultado, demo: false };
  } catch {
    return { perfil: null, demo: false };
  }
}

// --- Inventario (Modo Producción Real) ---
export async function listarProductos(token) {
  try {
    const { productos } = await apiFetch('/api/inventario', { token });
    return { productos: productos || [], demo: false };
  } catch (err) {
    if (esErrorSinBackend(err)) return { productos: [], demo: false };
    throw err;
  }
}

export async function crearProducto(payload, token) {
  try {
    const { producto } = await apiFetch('/api/inventario', { method: 'POST', body: payload, token });
    return { producto, demo: false };
  } catch (err) {
    throw err;
  }
}

export async function editarProducto(id, payload, token) {
  try {
    const { producto } = await apiFetch(`/api/inventario/${id}`, { method: 'PATCH', body: payload, token });
    return { producto, demo: false };
  } catch (err) {
    throw err;
  }
}

export async function borrarProducto(id, token) {
  try {
    await apiFetch(`/api/inventario/${id}`, { method: 'DELETE', token });
    return { demo: false };
  } catch (err) {
    throw err;
  }
}

export async function auditarInventario(token) {
  try {
    const resultado = await apiFetch('/api/inventario/auditoria', { method: 'POST', token });
    return { ...resultado, demo: false };
  } catch (err) {
    throw err;
  }
}

// --- Servicios (Fase 4) — catálogo espejo de productos, sin stock ---
export async function listarServicios(token) {
  try {
    const { servicios } = await apiFetch('/api/servicios', { token });
    return { servicios, demo: false };
  } catch (err) {
    if (esErrorSinBackend(err)) return { servicios: demoListar ? [] : [], demo: true };
    throw err;
  }
}

export async function crearServicio(payload, token) {
  const { servicio } = await apiFetch('/api/servicios', { method: 'POST', body: payload, token });
  return { servicio, demo: false };
}

export async function editarServicio(id, payload, token) {
  const { servicio } = await apiFetch(`/api/servicios/${id}`, { method: 'PATCH', body: payload, token });
  return { servicio, demo: false };
}

export async function borrarServicio(id, token) {
  await apiFetch(`/api/servicios/${id}`, { method: 'DELETE', token });
  return { demo: false };
}

// --- Gastos ---
export async function listarGastos(token) {
  try {
    const { gastos } = await apiFetch('/api/gastos', { token });
    return { gastos: gastos || [], demo: false };
  } catch (err) {
    if (esErrorSinBackend(err)) return { gastos: [], demo: false };
    throw err;
  }
}

export async function crearGasto(payload, token) {
  try {
    const { gasto } = await apiFetch('/api/gastos', { method: 'POST', body: payload, token });
    return { gasto, demo: false };
  } catch (err) {
    if (err instanceof ApiError && err.status === 400) throw err;
    if (esErrorSinBackend(err)) throw new ApiError(SOLO_CON_CUENTA, 0);
    throw err;
  }
}

export async function editarGasto(id, payload, token) {
  try {
    const { gasto } = await apiFetch(`/api/gastos/${id}`, { method: 'PATCH', body: payload, token });
    return { gasto, demo: false };
  } catch (err) {
    if (err instanceof ApiError && (err.status === 400 || err.status === 404)) throw err;
    if (esErrorSinBackend(err)) throw new ApiError(SOLO_CON_CUENTA, 0);
    throw err;
  }
}

export async function borrarGasto(id, token) {
  try {
    await apiFetch(`/api/gastos/${id}`, { method: 'DELETE', token });
    return { demo: false };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) throw err;
    if (esErrorSinBackend(err)) throw new ApiError(SOLO_CON_CUENTA, 0);
    throw err;
  }
}

// --- Dashboard y Ventas ---
export async function obtenerDashboard(token) {
  try {
    const resultado = await apiFetch('/api/dashboard', { token });
    return { ...resultado, demo: false };
  } catch (err) {
    throw err;
  }
}

export async function listarVentas(token) {
  try {
    const { ventas } = await apiFetch('/api/ventas', { token });
    return { ventas: ventas || [], demo: false };
  } catch (err) {
    if (esErrorSinBackend(err)) return { ventas: [], demo: false };
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

// --- Clientes y crédito ---
export async function listarClientes(token) {
  try {
    const { clientes } = await apiFetch('/api/clientes', { token });
    return { clientes: clientes || [], demo: false };
  } catch (err) {
    if (esErrorSinBackend(err)) return { clientes: [], demo: false };
    throw err;
  }
}

export async function crearCliente(payload, token) {
  try {
    const { cliente } = await apiFetch('/api/clientes', { method: 'POST', body: payload, token });
    return cliente;
  } catch (err) {
    if (err instanceof ApiError && err.status === 400) throw err;
    if (esErrorSinBackend(err)) throw new ApiError(SOLO_CON_CUENTA, 0);
    throw err;
  }
}

export async function obtenerSaldosCredito(token) {
  try {
    const { saldos } = await apiFetch('/api/clientes/saldos', { token });
    return { saldos: saldos || [], demo: false };
  } catch (err) {
    if (esErrorSinBackend(err)) return { saldos: [], demo: false };
    throw err;
  }
}

export async function marcarVentaPagada(id, token) {
  try {
    const { venta } = await apiFetch(`/api/ventas/${id}/pagar`, { method: 'PATCH', token });
    return { venta, demo: false };
  } catch (err) {
    if (err instanceof ApiError && (err.status === 400 || err.status === 404)) throw err;
    if (esErrorSinBackend(err)) throw new ApiError(SOLO_CON_CUENTA, 0);
    throw err;
  }
}

// --- Chatbot, Pagos y Planes ---
export async function enviarMensajeChatbot(mensaje, token) {
  return apiFetch('/api/chatbot/mensajes', { method: 'POST', body: { mensaje }, token });
}

export async function iniciarPago(plan, token) {
  return apiFetch('/api/pagos/iniciar', { method: 'POST', body: { plan }, token });
}

export async function obtenerCatalogoPlanes(token) {
  const resultado = await apiFetch('/api/planes', { token });
  return resultado.planes || [];
}

export async function obtenerHistorial({ pagina = 1, porPagina = 10 } = {}, token) {
  try {
    const resultado = await apiFetch(`/api/historial?pagina=${pagina}&porPagina=${porPagina}`, { token });
    return { ...resultado, demo: false };
  } catch (err) {
    if (esErrorSinBackend(err)) return { items: [], pagina, porPagina, total: 0, demo: false };
    throw err;
  }
}

// --- Análisis de zona (Estudio de Mercado) ---
export async function analizarZona(payload, token) {
  try {
    const resultado = await apiFetch('/api/analizar', {
      method: 'POST',
      body: payload,
      token,
    });
    return { ...resultado, demo: false };
  } catch (err) {
    if (esErrorSinBackend(err)) {
      throw new ApiError(SOLO_CON_CUENTA, 0);
    }
    throw err;
  }
}