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

const TIPOS_ITEM = [
  { clave: 'producto', etiqueta: 'Productos' },
  { clave: 'servicio', etiqueta: 'Servicios' },
];

const FILTROS_STOCK = [
  { clave: 'todos', etiqueta: 'Todos' },
  { clave: 'en_stock', etiqueta: 'En stock' },
  { clave: 'stock_bajo', etiqueta: 'Stock bajo' },
];

const METODOS_PAGO = [
  { clave: 'efectivo', etiqueta: 'Efectivo' },
  { clave: 'credito', etiqueta: 'Crédito' },
  { clave: 'digital', etiqueta: 'Digital' },
];

const CANALES_DIGITALES = [
  { clave: 'nequi', etiqueta: 'Nequi' },
  { clave: 'daviplata', etiqueta: 'Daviplata' },
  { clave: 'bancolombia', etiqueta: 'Bancolombia' },
  { clave: 'otro', etiqueta: 'Otro' },
];

function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// `onRegistrar` recibe { items, metodo_pago, cliente_id?, canal_digital? }.
// Cada línea de `items` trae { tipo: 'producto'|'servicio', producto_id? o
// servicio_id?, cantidad } — el backend ya sabe leer ambas formas (Fase 4).
export default function RegistrarVenta({ productos, servicios, clientes, guardando, error, onRegistrar, onCrearCliente }) {
  // --- Qué se está vendiendo ahora mismo: catálogo activo + ítem elegido ---
  const [tipoActivo, setTipoActivo] = useState('producto');
  const [itemId, setItemId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [lineas, setLineas] = useState([]);

  const [busqueda, setBusqueda] = useState('');
  const [filtroStock, setFiltroStock] = useState('todos');

  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [clienteId, setClienteId] = useState(null);
  const [canalDigital, setCanalDigital] = useState(null);

  const catalogoActivo = tipoActivo === 'producto' ? productos : servicios;
  const itemSel = catalogoActivo.find((x) => x.id === itemId) || null;

  const lineasEfectivas = useMemo(() => {
    if (!itemSel || cantidad <= 0) return lineas;
    const pendiente = {
      tipo: tipoActivo,
      [tipoActivo === 'producto' ? 'producto_id' : 'servicio_id']: itemSel.id,
      nombre: itemSel.nombre,
      precio: Number(itemSel.precio),
      cantidad,
    };
    return [...lineas, pendiente];
  }, [lineas, itemSel, cantidad, tipoActivo]);

  const total = lineasEfectivas.reduce((suma, l) => suma + l.precio * l.cantidad, 0);

  // El stock disponible solo aplica a productos — un servicio no tiene límite.
  const yaEnLaVenta =
    tipoActivo === 'producto'
      ? lineas.filter((l) => l.tipo === 'producto' && l.producto_id === itemId).reduce((s, l) => s + l.cantidad, 0)
      : 0;
  const disponible = itemSel && tipoActivo === 'producto' ? Number(itemSel.stock_actual) - yaEnLaVenta : null;
  const excedeStock = tipoActivo === 'producto' && Boolean(itemSel) && disponible !== null && cantidad > disponible;

  const faltaCliente = metodoPago === 'credito' && !clienteId;
  const faltaCanal = metodoPago === 'digital' && !canalDigital;

  const itemsFiltrados = useMemo(() => {
    const q = normalizar(busqueda);
    return catalogoActivo.filter((it) => {
      if (tipoActivo === 'producto' && filtroStock !== 'todos' && estadoStock(it).clave !== filtroStock) return false;
      if (q && !normalizar(it.nombre).includes(q)) return false;
      return true;
    });
  }, [catalogoActivo, busqueda, filtroStock, tipoActivo]);

  function cambiarTipoActivo(tipo) {
    setTipoActivo(tipo);
    setItemId('');
    setCantidad(1);
    setBusqueda('');
    setFiltroStock('todos');
  }

  function seleccionar(item) {
    setItemId(item.id);
    setCantidad(1);
  }

  function cambiarSeleccion() {
    setItemId('');
    setCantidad(1);
  }

  function agregarOtro() {
    if (!itemSel || cantidad <= 0) return;
    setLineas((prev) => [
      ...prev,
      {
        tipo: tipoActivo,
        [tipoActivo === 'producto' ? 'producto_id' : 'servicio_id']: itemSel.id,
        nombre: itemSel.nombre,
        precio: Number(itemSel.precio),
        cantidad,
      },
    ]);
    cambiarSeleccion();
    setBusqueda('');
  }

  function quitarLinea(indice) {
    setLineas((prev) => prev.filter((_, i) => i !== indice));
  }

  async function registrar() {
    const items = lineasEfectivas.map((l) => ({
      tipo: l.tipo,
      producto_id: l.producto_id,
      servicio_id: l.servicio_id,
      cantidad: l.cantidad,
    }));
    const ok = await onRegistrar({
      items,
      metodo_pago: metodoPago,
      cliente_id: metodoPago === 'credito' ? clienteId : undefined,
      canal_digital: metodoPago === 'digital' ? canalDigital : undefined,
    });
    if (ok) {
      setLineas([]);
      cambiarSeleccion();
      setBusqueda('');
      setMetodoPago('efectivo');
      setClienteId(null);
      setCanalDigital(null);
    }
  }

  if (productos.length === 0 && servicios.length === 0) {
    return (
      <Card className="shadow-md">
        <EmptyState
          emoji="📦"
          titulo="Primero necesitas productos o servicios"
          descripcion="Las ventas se registran sobre tu catálogo — agrega al menos uno para empezar."
        >
          <Link href="/inventario">
            <Button fullWidth={false} className="px-5 mx-auto">
              <Plus className="h-4 w-4" /> Ir a Catálogo
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
        {/* Tabs Productos / Servicios — solo mientras no hay ítem elegido, para
            no perder el contexto de qué se está agregando a mitad de camino. */}
        {!itemSel && (
          <div className="flex bg-arena rounded-xl p-0.5 gap-0.5">
            {TIPOS_ITEM.map((t) => (
              <button
                key={t.clave}
                type="button"
                onClick={() => cambiarTipoActivo(t.clave)}
                className={`flex-1 py-2 text-center text-[12px] font-medium rounded-[9px] transition ${
                  tipoActivo === t.clave ? 'bg-white text-verde shadow-sm font-semibold' : 'text-gris'
                }`}
              >
                {t.etiqueta}
              </button>
            ))}
          </div>
        )}

        {itemSel && (
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label className="text-xs font-medium text-gris">
                {tipoActivo === 'producto' ? 'Producto' : 'Servicio'}
              </label>
              <button type="button" onClick={cambiarSeleccion} className="text-[11px] text-verde font-medium">
                Cambiar {tipoActivo === 'producto' ? 'producto' : 'servicio'}
              </button>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl border-[1.5px] border-verde bg-verde-claro mb-3">
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium text-negro truncate">{itemSel.nombre}</div>
                <div className="text-[11px] text-gris">
                  {formatoCOP(itemSel.precio)}
                  {tipoActivo === 'producto' && ` · ${disponible} disponible${disponible === 1 ? '' : 's'}`}
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

        {!itemSel && (
          <div>
            <div className="relative">
              <Search className="h-4 w-4 text-gris absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={tipoActivo === 'producto' ? 'Buscar producto…' : 'Buscar servicio…'}
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

            {/* Los chips de stock solo aplican a productos — un servicio nunca
                está "en stock" o "bajo". */}
            {tipoActivo === 'producto' && (
              <div className="flex gap-1.5 mt-2.5 mb-2.5">
                {FILTROS_STOCK.map((f) => (
                  <button
                    key={f.clave}
                    type="button"
                    onClick={() => setFiltroStock(f.clave)}
                    className={`px-3 py-1.5 rounded-full border-[1.5px] text-[12px] font-medium transition ${
                      filtroStock === f.clave
                        ? 'bg-verde border-verde text-white'
                        : 'bg-white border-borde text-gris hover:border-verde-suave'
                    }`}
                  >
                    {f.etiqueta}
                  </button>
                ))}
              </div>
            )}
            {tipoActivo === 'servicio' && <div className="h-2.5" />}

            <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto -mx-1 px-1">
              {itemsFiltrados.length === 0 && (
                <div className="text-[12px] text-gris text-center py-6">
                  {catalogoActivo.length === 0
                    ? tipoActivo === 'producto'
                      ? 'No tienes productos en tu catálogo.'
                      : 'No tienes servicios en tu catálogo — agrega uno en Catálogo → Servicios.'
                    : `Ningún resultado coincide con "${busqueda}".`}
                </div>
              )}
              {itemsFiltrados.map((it) => {
                const sinStock = tipoActivo === 'producto' && Number(it.stock_actual) <= 0;
                const estado = tipoActivo === 'producto' ? estadoStock(it) : null;
                return (
                  <button
                    key={it.id}
                    type="button"
                    disabled={sinStock}
                    onClick={() => seleccionar(it)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl border-[1.5px] border-borde bg-white text-left transition hover:border-verde-suave disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-negro truncate">{it.nombre}</div>
                      <div className="text-[11px] text-gris">{formatoCOP(it.precio)}</div>
                    </div>
                    {estado && <Badge tone={estado.tone}>{estado.texto}</Badge>}
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
                <div key={`${l.tipo}-${l.producto_id || l.servicio_id}-${i}`} className="flex items-center gap-2 text-[13px]">
                  <span className="flex-1 min-w-0 truncate text-negro">
                    {l.cantidad} × {l.nombre}
                    {l.tipo === 'servicio' && <span className="text-gris"> (servicio)</span>}
                  </span>
                  <span className="text-negro font-medium">{formatoCOP(l.precio * l.cantidad)}</span>
                  <button onClick={() => quitarLinea(i)} className="text-gris" aria-label="Quitar">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {itemSel && cantidad > 0 && (
                <div className="flex items-center gap-2 text-[13px] text-gris">
                  <span className="flex-1 min-w-0 truncate">
                    {cantidad} × {itemSel.nombre}
                    {tipoActivo === 'servicio' && ' (servicio)'}
                  </span>
                  <span className="font-medium">{formatoCOP(Number(itemSel.precio) * cantidad)}</span>
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
                    if (m.clave !== 'credito') setClienteId(null);
                    if (m.clave !== 'digital') setCanalDigital(null);
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

        {lineasEfectivas.length > 0 && metodoPago === 'digital' && (
          <div>
            <label className="text-xs font-medium text-gris mb-1.5 block">¿Por dónde llegó el pago?</label>
            <div className="flex gap-1.5 flex-wrap">
              {CANALES_DIGITALES.map((c) => (
                <button
                  key={c.clave}
                  type="button"
                  onClick={() => setCanalDigital(c.clave)}
                  className={`px-3.5 py-2 rounded-full border-[1.5px] text-[12px] font-medium transition ${
                    canalDigital === c.clave
                      ? 'bg-verde border-verde text-white'
                      : 'bg-white border-borde text-gris hover:border-verde-suave'
                  }`}
                >
                  {c.etiqueta}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <Alert tone="error">{error}</Alert>}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={!itemSel || excedeStock}
            onClick={agregarOtro}
          >
            <Plus className="h-4 w-4" /> Otro ítem
          </Button>
          <Button
            className="flex-[2]"
            loading={guardando}
            disabled={lineasEfectivas.length === 0 || excedeStock || faltaCliente || faltaCanal}
            onClick={registrar}
          >
            {metodoPago === 'credito' ? 'Registrar a crédito' : 'Cobrar'} {total > 0 ? formatoCOP(total) : ''}
          </Button>
        </div>

        {faltaCliente && (
          <div className="text-[11px] text-rojo text-center -mt-1.5">Elige o crea un cliente para vender a crédito.</div>
        )}
        {faltaCanal && (
          <div className="text-[11px] text-rojo text-center -mt-1.5">Elige por dónde llegó el pago digital.</div>
        )}
      </div>
    </Card>
  );
}
