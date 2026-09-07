/* RUTA DEL ARCHIVO: frontend/src/components/ventas/RegistrarVenta.jsx */
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Search, ShoppingCart, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';
import ClientePicker from '@/components/ventas/ClientePicker';
import { estadoStock } from '@/lib/inventario';
import { formatoCOP } from '@/lib/formato';

const FILTROS = [
  { clave: 'todos', etiqueta: 'Todos' },
  { clave: 'en_stock', etiqueta: 'En stock' },
  { clave: 'stock_bajo', etiqueta: 'Stock bajo' },
];

const METODOS_PAGO = [
  { clave: 'efectivo', etiqueta: 'Efectivo' },
  { clave: 'credito', etiqueta: 'Crédito' },
];

function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// `onRegistrar` ahora recibe un objeto { items, metodo_pago, cliente_id } en
// vez de solo `items` — VentasPage.js debe actualizarse para pasar esos campos
// a la API tal cual (ver instrucciones aparte).
// `clientes` y `onCrearCliente` vienen del padre (VentasPage), igual que
// `productos` — este componente no habla directo con la API.
export default function RegistrarVenta({ productos, clientes, guardando, error, onRegistrar, onCrearCliente }) {
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [lineas, setLineas] = useState([]);

  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todos');

  // --- Método de pago (nuevo) ---
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [clienteId, setClienteId] = useState(null);

  const productoSel = productos.find((p) => p.id === productoId) || null;

  const lineasEfectivas = useMemo(() => {
    const pendiente = productoSel && cantidad > 0
      ? [{ producto_id: productoSel.id, nombre: productoSel.nombre, precio: Number(productoSel.precio), cantidad }]
      : [];
    return [...lineas, ...pendiente];
  }, [lineas, productoSel, cantidad]);

  const total = lineasEfectivas.reduce((suma, l) => suma + l.precio * l.cantidad, 0);

  const yaEnLaVenta = lineas.filter((l) => l.producto_id === productoId).reduce((suma, l) => suma + l.cantidad, 0);
  const disponible = productoSel ? Number(productoSel.stock_actual) - yaEnLaVenta : 0;
  const excedeStock = Boolean(productoSel) && cantidad > disponible;

  // Una venta a crédito sin cliente no se puede cobrar — el backend también lo
  // valida, pero avisarlo aquí evita el viaje de ida y vuelta al servidor.
  const faltaCliente = metodoPago === 'credito' && !clienteId;

  const productosFiltrados = useMemo(() => {
    const q = normalizar(busqueda);
    return productos.filter((p) => {
      if (filtro !== 'todos' && estadoStock(p).clave !== filtro) return false;
      if (q && !normalizar(p.nombre).includes(q)) return false;
      return true;
    });
  }, [productos, busqueda, filtro]);

  function seleccionar(producto) {
    setProductoId(producto.id);
    setCantidad(1);
  }

  function cambiarProducto() {
    setProductoId('');
    setCantidad(1);
  }

  function agregarOtro() {
    if (!productoSel || cantidad <= 0) return;
    setLineas((prev) => [...prev, { producto_id: productoSel.id, nombre: productoSel.nombre, precio: Number(productoSel.precio), cantidad }]);
    cambiarProducto();
    setBusqueda('');
  }

  function quitarLinea(indice) {
    setLineas((prev) => prev.filter((_, i) => i !== indice));
  }

  async function registrar() {
    const items = lineasEfectivas.map((l) => ({ producto_id: l.producto_id, cantidad: l.cantidad }));
    const ok = await onRegistrar({
      items,
      metodo_pago: metodoPago,
      cliente_id: metodoPago === 'credito' ? clienteId : undefined,
    });
    if (ok) {
      setLineas([]);
      cambiarProducto();
      setBusqueda('');
      setMetodoPago('efectivo');
      setClienteId(null);
    }
  }

  if (productos.length === 0) {
    return (
      <Card className="shadow-md">
        <EmptyState
          emoji="📦"
          titulo="Primero necesitas productos"
          descripcion="Las ventas se registran sobre tu inventario, para poder descontar el stock y calcular tu ganancia."
        >
          <Link href="/inventario">
            <Button fullWidth={false} className="px-5 mx-auto">
              <Plus className="h-4 w-4" /> Ir a Inventario
            </Button>
          </Link>
        </EmptyState>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <ShoppingCart className="h-4 w-4 text-verde" />
        <span className="text-[13px] font-semibold text-negro">Registrar una venta</span>
      </div>

      <div className="flex flex-col gap-3">
        {productoSel && (
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label className="text-xs font-medium text-gris">Producto</label>
              <button type="button" onClick={cambiarProducto} className="text-[11px] text-verde font-medium">
                Cambiar producto
              </button>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl border-[1.5px] border-verde bg-verde-claro mb-3">
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium text-negro truncate">{productoSel.nombre}</div>
                <div className="text-[11px] text-gris">
                  {formatoCOP(productoSel.precio)} · {disponible} disponible{disponible === 1 ? '' : 's'}
                </div>
              </div>
            </div>

            <label className="text-xs font-medium text-gris">Cantidad</label>
            <div className="flex items-center gap-3 mt-1.5">
              <button
                type="button"
                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                className="h-11 w-11 rounded-xl bg-white border-[1.5px] border-borde text-negro flex items-center justify-center active:scale-95 shadow-sm"
                aria-label="Quitar una unidad"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                className="flex-1 h-11 text-center rounded-xl border-[1.5px] border-borde bg-white text-[17px] font-semibold text-negro outline-none focus:border-verde"
              />
              <button
                type="button"
                onClick={() => setCantidad((c) => c + 1)}
                className="h-11 w-11 rounded-xl bg-white border-[1.5px] border-borde text-negro flex items-center justify-center active:scale-95 shadow-sm"
                aria-label="Agregar una unidad"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {excedeStock && (
              <div className="text-[11px] text-rojo mt-1.5">
                Solo tienes {disponible} disponible{disponible === 1 ? '' : 's'} de este producto.
              </div>
            )}
          </div>
        )}

        {!productoSel && (
          <div>
            <div className="relative">
              <Search className="h-4 w-4 text-gris absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar producto…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-9 py-3 rounded-xl border-[1.5px] border-borde bg-white text-[15px] text-negro outline-none transition focus:border-verde"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gris"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex gap-1.5 mt-2.5 mb-2.5">
              {FILTROS.map((f) => (
                <button
                  key={f.clave}
                  type="button"
                  onClick={() => setFiltro(f.clave)}
                  className={`px-3 py-1.5 rounded-full border-[1.5px] text-[12px] font-medium transition ${
                    filtro === f.clave
                      ? 'bg-verde border-verde text-white'
                      : 'bg-white border-borde text-gris hover:border-verde-suave'
                  }`}
                >
                  {f.etiqueta}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto -mx-1 px-1">
              {productosFiltrados.length === 0 && (
                <div className="text-[12px] text-gris text-center py-6">
                  Ningún producto coincide con "{busqueda}".
                </div>
              )}
              {productosFiltrados.map((p) => {
                const estado = estadoStock(p);
                const sinStock = Number(p.stock_actual) <= 0;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={sinStock}
                    onClick={() => seleccionar(p)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl border-[1.5px] border-borde bg-white text-left transition hover:border-verde-suave disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-negro truncate">{p.nombre}</div>
                      <div className="text-[11px] text-gris">{formatoCOP(p.precio)}</div>
                    </div>
                    <Badge tone={estado.tone}>{estado.texto}</Badge>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {lineasEfectivas.length > 0 && (
          <div className="bg-arena rounded-2xl p-3.5 shadow-sm">
            <div className="text-[11px] text-gris mb-2">Esta venta</div>
            <div className="flex flex-col gap-1.5">
              {lineas.map((l, i) => (
                <div key={`${l.producto_id}-${i}`} className="flex items-center gap-2 text-[13px]">
                  <span className="flex-1 min-w-0 truncate text-negro">
                    {l.cantidad} × {l.nombre}
                  </span>
                  <span className="text-negro font-medium">{formatoCOP(l.precio * l.cantidad)}</span>
                  <button onClick={() => quitarLinea(i)} className="text-gris" aria-label="Quitar">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {productoSel && cantidad > 0 && (
                <div className="flex items-center gap-2 text-[13px] text-gris">
                  <span className="flex-1 min-w-0 truncate">
                    {cantidad} × {productoSel.nombre}
                  </span>
                  <span className="font-medium">{formatoCOP(Number(productoSel.precio) * cantidad)}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-borde">
              <span className="text-[12px] font-semibold text-negro">Total</span>
              <span className="text-[17px] font-bold font-display text-verde">{formatoCOP(total)}</span>
            </div>
          </div>
        )}

        {lineasEfectivas.length > 0 && (
          <div>
            <label className="text-xs font-medium text-gris mb-1.5 block">Método de pago</label>
            <div className="flex gap-1.5">
              {METODOS_PAGO.map((m) => (
                <button
                  key={m.clave}
                  type="button"
                  onClick={() => {
                    setMetodoPago(m.clave);
                    if (m.clave === 'efectivo') setClienteId(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl border-[1.5px] text-[13px] font-medium transition ${
                    metodoPago === m.clave
                      ? 'bg-verde border-verde text-white'
                      : 'bg-white border-borde text-gris hover:border-verde-suave'
                  }`}
                >
                  {m.etiqueta}
                </button>
              ))}
            </div>
          </div>
        )}

        {lineasEfectivas.length > 0 && metodoPago === 'credito' && (
          <ClientePicker
            clientes={clientes}
            clienteId={clienteId}
            onSeleccionar={setClienteId}
            onCrearCliente={onCrearCliente}
          />
        )}

        {error && <Alert tone="error">{error}</Alert>}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={!productoSel || excedeStock}
            onClick={agregarOtro}
          >
            <Plus className="h-4 w-4" /> Otro producto
          </Button>
          <Button
            className="flex-[2]"
            loading={guardando}
            disabled={lineasEfectivas.length === 0 || excedeStock || faltaCliente}
            onClick={registrar}
          >
            {metodoPago === 'credito' ? 'Registrar a crédito' : 'Cobrar'} {total > 0 ? formatoCOP(total) : ''}
          </Button>
        </div>

        {faltaCliente && (
          <div className="text-[11px] text-rojo text-center -mt-1.5">Elige o crea un cliente para vender a crédito.</div>
        )}
      </div>
    </Card>
  );
}
