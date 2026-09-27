// RUTA DEL ARCHIVO: frontend/src/app/(app)/inventario/page.js
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
import CatalogoServicios from '@/components/inventario/CatalogoServicios';
import { estadoStock } from '@/lib/inventario';

const FORM_VACIO = { nombre: '', stock_actual: '', stock_minimo: '', precio: '', costo: '' };

function formatoCOP(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? `$${Math.round(n).toLocaleString('es-CO')}` : '—';
}

const TABS = [
  { id: 'productos', etiqueta: 'Productos' },
  { id: 'servicios', etiqueta: 'Servicios' },
];

export default function CatalogoPage() {
  const { token } = useAuth();
  const [tab, setTab] = useState('productos');

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('');

  const [form, setForm] = useState(FORM_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [auditoria, setAuditoria] = useState(null);
  const [auditando, setAuditando] = useState(false);

  const productosFiltrados = productos.filter((p) => 
    p.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  useEffect(() => {
    if (tab === 'productos') cargar();
  }, [token, tab]);

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      const r = await listarProductos(token);
      setProductos(r.productos || []);
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
    setGuardando(true);
    setError('');
    try {
      if (editandoId) {
        await editarProducto(editandoId, form, token);
      } else {
        await crearProducto(form, token);
      }
      cerrarForm();
      await cargar();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('No se pudo guardar el producto.');
      }
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(p) {
    if (!confirm(`¿Borrar ${p.nombre}?`)) return;
    try {
      await borrarProducto(p.id, token);
      await cargar();
    } catch {
      setError('No se pudo borrar el producto.');
    }
  }

  async function pedirAuditoria() {
    setAuditando(true);
    setError('');
    try {
      const r = await auditarInventario(token);
      setAuditoria(r.auditoria || null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('No se pudo generar la auditoría.');
      }
    } finally {
      setAuditando(false);
    }
  }

  return (
    <>
      <div>
        <div className="font-display font-bold text-lg text-negro mb-1">Catálogo</div>
        <div className="text-[13px] text-gris leading-relaxed">Todo lo que vendes: productos con stock y servicios.</div>
      </div>

      <div className="flex bg-white rounded-xl p-0.5 gap-0.5 border border-borde mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 px-1 text-center text-[12px] font-medium rounded-[9px] transition ${
              tab === t.id ? 'bg-verde text-white' : 'text-gris hover:bg-borde'
            }`}
          >
            {t.etiqueta}
          </button>
        ))}
      </div>

      {tab === 'productos' && (
        <>
          {error && (
            <Alert tone="rojo" className="mb-4">
              {error}
            </Alert>
          )}

          <div className="mb-4">
            <Button variant="dark" loading={auditando} onClick={pedirAuditoria} size="sm">
              <Sparkles className="h-4 w-4" /> Auditoría IA
            </Button>
          </div>
          <div className="mb-4">
            <Button variant="outline" onClick={abrirCrear} size="sm">
              <Plus className="h-4 w-4" /> Agregar producto
            </Button>
          </div>
          <div className="mb-4">
            <Input
              label="Buscar"
              placeholder="Nombre del producto"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>

          {mostrarForm && (
            <Card className="mb-4">
              <div className="mb-3">
                <div className="font-semibold text-negro">{editandoId ? 'Editar producto' : 'Nuevo producto'}</div>
                <div className="text-[13px] text-gris">Completa los campos para guardar.</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input label="Nombre" placeholder="Ej: Arroz 1kg" value={form.nombre} onChange={(e) => actualizarCampo('nombre', e.target.value)} />
                <Input label="Stock actual" type="number" min="0" placeholder="0" value={form.stock_actual} onChange={(e) => actualizarCampo('stock_actual', e.target.value)} />
                <Input label="Stock mínimo" type="number" min="0" placeholder="0" value={form.stock_minimo} onChange={(e) => actualizarCampo('stock_minimo', e.target.value)} />
                <Input label="Precio de venta" type="number" inputMode="decimal" min="0" placeholder="0" value={form.precio} onChange={(e) => actualizarCampo('precio', e.target.value)} />
                <Input label="Costo" type="number" inputMode="decimal" min="0" placeholder="0" value={form.costo} onChange={(e) => actualizarCampo('costo', e.target.value)} />
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={cerrarForm}>Cancelar</Button>
                <Button loading={guardando} onClick={guardar}>{editandoId ? 'Guardar cambios' : 'Agregar producto'}</Button>
              </div>
            </Card>
          )}

          {cargando && (
            <div className="py-8">
              <Spinner label="Cargando inventario..." />
            </div>
          )}

          {!cargando && productosFiltrados.length === 0 && !mostrarForm && (
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

          {!cargando && productosFiltrados.length > 0 && (
            <div className="flex flex-col gap-2">
              {productosFiltrados.map((p) => {
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
                      <button onClick={() => abrirEditar(p)} className="p-2 rounded-lg text-gris hover:bg-arena" aria-label="Editar">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => eliminar(p)} className="p-2 rounded-lg text-rojo hover:bg-rojo-claro" aria-label="Borrar">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {auditoria && (
            <div className="pt-2">
              <AuditoriaIA auditoria={auditoria} />
            </div>
          )}
        </>
      )}
      {tab === 'servicios' && (
        <CatalogoServicios />
      )}
    </>
      );
    }

