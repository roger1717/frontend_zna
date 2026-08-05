'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Sparkles, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  listarProductos,
  crearProducto,
  editarProducto,
  borrarProducto,
  auditarInventario,
  ApiError,
} from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import AuditoriaIA from '@/components/inventario/AuditoriaIA';

const FORM_VACIO = { nombre: '', stock_actual: '', stock_minimo: '', precio: '', costo: '' };

function formatoCOP(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? `$${Math.round(n).toLocaleString('es-CO')}` : '—';
}

// Estado del stock frente al mínimo → color del chip (dato REAL, va en verde/ámbar/rojo).
function estadoStock(p) {
  if (p.stock_actual <= 0) return { tone: 'rojo', texto: 'Sin stock' };
  if (p.stock_actual <= p.stock_minimo) return { tone: 'ambar', texto: 'Stock bajo' };
  return { tone: 'verde', texto: 'En stock' };
}

export default function InventarioPage() {
  const { token } = useAuth();

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState(FORM_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [auditoria, setAuditoria] = useState(null);
  const [auditando, setAuditando] = useState(false);

  useEffect(() => {
    cargar();
  }, [token]);

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      const r = await listarProductos(token);
      setProductos(r.productos || []);
      setDemo(r.demo);
    } catch {
      setError('No se pudo cargar tu inventario.');
    } finally {
      setCargando(false);
    }
  }

  function abrirCrear() {
    setForm(FORM_VACIO);
    setEditandoId(null);
    setMostrarForm(true);
    setError('');
  }

  function abrirEditar(p) {
    setForm({
      nombre: p.nombre,
      stock_actual: String(p.stock_actual),
      stock_minimo: String(p.stock_minimo),
      precio: String(p.precio),
      costo: String(p.costo),
    });
    setEditandoId(p.id);
    setMostrarForm(true);
    setError('');
  }

  function cerrarForm() {
    setMostrarForm(false);
    setEditandoId(null);
    setForm(FORM_VACIO);
  }

  function actualizarCampo(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function guardar() {
    if (!form.nombre.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    const payload = {
      nombre: form.nombre.trim(),
      stock_actual: Number(form.stock_actual) || 0,
      stock_minimo: Number(form.stock_minimo) || 0,
      precio: Number(form.precio) || 0,
      costo: Number(form.costo) || 0,
    };

    setGuardando(true);
    setError('');
    try {
      if (editandoId) {
        await editarProducto(editandoId, payload, token);
      } else {
        await crearProducto(payload, token);
      }
      cerrarForm();
      setAuditoria(null); // el inventario cambió; la auditoría anterior ya no aplica
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar el producto.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(p) {
    if (!confirm(`¿Borrar "${p.nombre}"?`)) return;
    setError('');
    try {
      await borrarProducto(p.id, token);
      setAuditoria(null);
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo borrar el producto.');
    }
  }

  async function pedirAuditoria() {
    setAuditando(true);
    setError('');
    try {
      const r = await auditarInventario(token);
      setAuditoria(r);
    } catch {
      setError('No se pudo generar la auditoría. Intenta de nuevo.');
    } finally {
      setAuditando(false);
    }
  }

  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-display font-bold text-lg text-negro mb-1">Inventario</div>
          <div className="text-[13px] text-gris leading-relaxed">
            Administra tus productos y pide una auditoría con IA.
          </div>
        </div>
        {!mostrarForm && (
          <Button fullWidth={false} size="sm" className="px-3 flex-shrink-0" onClick={abrirCrear}>
            <Plus className="h-4 w-4" /> Nuevo
          </Button>
        )}
      </div>

      {demo && (
        <Alert tone="demo">
          Modo de ejemplo — inicia sesión con una cuenta real (Supabase) para guardar tu inventario de verdad.
        </Alert>
      )}

      {error && <Alert tone="error">{error}</Alert>}

      {mostrarForm && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-semibold text-negro">
              {editandoId ? 'Editar producto' : 'Nuevo producto'}
            </span>
            <button onClick={cerrarForm} className="text-gris" aria-label="Cerrar">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <Input
              label="Nombre"
              placeholder="Ej. Arepa de maíz"
              value={form.nombre}
              onChange={(e) => actualizarCampo('nombre', e.target.value)}
              autoFocus
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Stock actual"
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="0"
                value={form.stock_actual}
                onChange={(e) => actualizarCampo('stock_actual', e.target.value)}
              />
              <Input
                label="Stock mínimo"
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="0"
                value={form.stock_minimo}
                onChange={(e) => actualizarCampo('stock_minimo', e.target.value)}
              />
              <Input
                label="Precio de venta"
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="0"
                value={form.precio}
                onChange={(e) => actualizarCampo('precio', e.target.value)}
              />
              <Input
                label="Costo"
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="0"
                value={form.costo}
                onChange={(e) => actualizarCampo('costo', e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={cerrarForm}>
                Cancelar
              </Button>
              <Button loading={guardando} onClick={guardar}>
                {editandoId ? 'Guardar cambios' : 'Agregar producto'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {cargando && (
        <div className="py-8">
          <Spinner label="Cargando inventario..." />
        </div>
      )}

      {!cargando && productos.length === 0 && !mostrarForm && (
        <EmptyState
          emoji="📦"
          titulo="Tu inventario está vacío"
          descripcion="Agrega tu primer producto para empezar a llevar el control de tu stock."
        >
          <Button fullWidth={false} className="px-5 mx-auto" onClick={abrirCrear}>
            <Plus className="h-4 w-4" /> Agregar producto
          </Button>
        </EmptyState>
      )}

      {!cargando && productos.length > 0 && (
        <div className="flex flex-col gap-2">
          {productos.map((p) => {
            const estado = estadoStock(p);
            return (
              <Card key={p.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[14px] font-semibold text-negro truncate">{p.nombre}</span>
                    <Badge tone={estado.tone}>{estado.texto}</Badge>
                  </div>
                  <div className="text-[12px] text-gris">
                    Stock: <span className="font-medium text-negro">{p.stock_actual}</span>
                    {' · '}mín: {p.stock_minimo}
                    {' · '}precio: {formatoCOP(p.precio)}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => abrirEditar(p)}
                    className="p-2 rounded-lg text-gris hover:bg-arena"
                    aria-label="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => eliminar(p)}
                    className="p-2 rounded-lg text-rojo hover:bg-rojo-claro"
                    aria-label="Borrar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {!cargando && productos.length > 0 && (
        <div className="pt-1">
          <Button variant="dark" loading={auditando} onClick={pedirAuditoria}>
            <Sparkles className="h-4 w-4" /> Auditoría IA
          </Button>
        </div>
      )}

      {auditoria && (
        <div className="pt-2">
          <AuditoriaIA auditoria={auditoria} />
        </div>
      )}
    </>
  );
}
