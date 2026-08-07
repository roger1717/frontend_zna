'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, ShoppingCart, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';
import { formatoCOP } from '@/lib/formato';

// Registrar una venta tiene que poderse hacer con una mano y en pocos segundos,
// mientras el cliente espera en el mostrador. De ahí las decisiones de esta
// pantalla: cantidad con botones − / + (no teclado numérico), el producto
// seleccionado cuenta como parte de la venta sin necesidad de "agregarlo", y el
// botón principal siempre dice qué va a cobrar.
export default function RegistrarVenta({ productos, guardando, error, onRegistrar }) {
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [lineas, setLineas] = useState([]);

  const productoSel = productos.find((p) => p.id === productoId) || null;

  // La selección actual ya cuenta como parte de la venta: para vender un solo
  // producto (el caso de siempre) son dos toques y no tres. Se muestra en la
  // lista de abajo para que no haya sorpresas de qué se va a cobrar.
  const lineasEfectivas = useMemo(() => {
    const pendiente =
      productoSel && cantidad > 0
        ? [{ producto_id: productoSel.id, nombre: productoSel.nombre, precio: Number(productoSel.precio), cantidad }]
        : [];
    return [...lineas, ...pendiente];
  }, [lineas, productoSel, cantidad]);

  const total = lineasEfectivas.reduce((suma, l) => suma + l.precio * l.cantidad, 0);

  // Cuánto queda disponible del producto seleccionado descontando lo que ya se
  // puso en esta misma venta (si no, se podría armar una venta que el backend va
  // a rechazar y el tendero no entendería por qué).
  const yaEnLaVenta = lineas
    .filter((l) => l.producto_id === productoId)
    .reduce((suma, l) => suma + l.cantidad, 0);
  const disponible = productoSel ? Number(productoSel.stock_actual) - yaEnLaVenta : 0;
  const excedeStock = Boolean(productoSel) && cantidad > disponible;

  function agregarOtro() {
    if (!productoSel || cantidad <= 0) return;
    setLineas((prev) => [
      ...prev,
      { producto_id: productoSel.id, nombre: productoSel.nombre, precio: Number(productoSel.precio), cantidad },
    ]);
    setProductoId('');
    setCantidad(1);
  }

  function quitarLinea(indice) {
    setLineas((prev) => prev.filter((_, i) => i !== indice));
  }

  async function registrar() {
    const items = lineasEfectivas.map((l) => ({ producto_id: l.producto_id, cantidad: l.cantidad }));
    const ok = await onRegistrar(items);
    if (ok) {
      setLineas([]);
      setProductoId('');
      setCantidad(1);
    }
  }

  if (productos.length === 0) {
    return (
      <Card>
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
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <ShoppingCart className="h-4 w-4 text-verde" />
        <span className="text-[13px] font-semibold text-negro">Registrar una venta</span>
      </div>

      <div className="flex flex-col gap-3">
        <Select
          label="Producto"
          value={productoId}
          onChange={(e) => {
            setProductoId(e.target.value);
            setCantidad(1);
          }}
        >
          <option value="">Elige un producto…</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id} disabled={Number(p.stock_actual) <= 0}>
              {p.nombre} — {formatoCOP(p.precio)}
              {Number(p.stock_actual) <= 0 ? ' (sin stock)' : ` (${p.stock_actual} disp.)`}
            </option>
          ))}
        </Select>

        {productoSel && (
          <div>
            <label className="text-xs font-medium text-gris">Cantidad</label>
            <div className="flex items-center gap-3 mt-1.5">
              <button
                type="button"
                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                className="h-11 w-11 rounded-xl border-[1.5px] border-borde text-negro flex items-center justify-center active:scale-95"
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
                className="flex-1 h-11 text-center rounded-xl border-[1.5px] border-borde text-[17px] font-semibold text-negro outline-none focus:border-verde"
              />
              <button
                type="button"
                onClick={() => setCantidad((c) => c + 1)}
                className="h-11 w-11 rounded-xl border-[1.5px] border-borde text-negro flex items-center justify-center active:scale-95"
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

        {lineasEfectivas.length > 0 && (
          <div className="bg-arena rounded-xl p-3">
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
            disabled={lineasEfectivas.length === 0 || excedeStock}
            onClick={registrar}
          >
            Cobrar {total > 0 ? formatoCOP(total) : ''}
          </Button>
        </div>
      </div>
    </Card>
  );
}
