/* RUTA DEL ARCHIVO: frontend/src/components/inventario/CatalogoServicios.jsx */
'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { listarServicios, crearServicio, editarServicio, borrarServicio } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { formatoCOP } from '@/lib/formato';

const FORM_VACIO = { nombre: '', precio: '', costo: '' };

// Mismo patrón que InventarioPage.js (crear/editar con un solo form, toggle de
// visibilidad) pero sin stock_actual/stock_minimo — un servicio no se agota.
export default function CatalogoServicios() {
  const { token } = useAuth();

  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState(FORM_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargar();
  }, [token]);

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      const r = await listarServicios(token);
      setServicios(r.servicios || []);
    } catch {
      setError('No se pudo cargar el catálogo de servicios.');
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

  function abrirEditar(s) {
    setForm({ nombre: s.nombre, precio: String(s.precio), costo: String(s.costo) });
    setEditandoId(s.id);
    setMostrarForm(true);
    setError('');
  }

  function cerrarForm() {
    setMostrarForm(false);
    setEditandoId(null);
    setForm(FORM_VACIO);
  }

  async function guardar() {
    if (!form.nombre.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    const payload = {
      nombre: form.nombre.trim(),
      precio: Number(form.precio) || 0,
      costo: Number(form.costo) || 0,
    };

    setGuardando(true);
    setError('');
    try {
      if (editandoId) {
        await editarServicio(editandoId, payload, token);
      } else {
        await crearServicio(payload, token);
      }
      cerrarForm();
      await cargar();
    } catch (err) {
      setError(err?.message || 'No se pudo guardar el servicio.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(s) {
    if (!confirm(`¿Borrar "${s.nombre}"?`)) return;
    setError('');
    try {
      await borrarServicio(s.id, token);
      await cargar();
    } catch (err) {
      setError(err?.message || 'No se pudo borrar el servicio.');
    }
  }

  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="text-[13px] text-gris leading-relaxed">
          Corte, diagnóstico, cambio de aceite — cualquier cosa que vendas sin descontar stock.
        </div>
        {!mostrarForm && (
          <Button fullWidth={false} size="sm" className="px-3 flex-shrink-0" onClick={abrirCrear}>
            <Plus className="h-4 w-4" /> Nuevo
          </Button>
        )}
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {mostrarForm && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-semibold text-negro">
              {editandoId ? 'Editar servicio' : 'Nuevo servicio'}
            </span>
            <button onClick={cerrarForm} className="text-gris" aria-label="Cerrar">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <Input
              label="Nombre"
              placeholder="Ej. Corte caballero"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              autoFocus
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Precio"
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="0"
                value={form.precio}
                onChange={(e) => setForm((f) => ({ ...f, precio: e.target.value }))}
              />
              <Input
                label="Costo (insumos)"
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="0"
                value={form.costo}
                onChange={(e) => setForm((f) => ({ ...f, costo: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={cerrarForm}>
                Cancelar
              </Button>
              <Button loading={guardando} onClick={guardar}>
                {editandoId ? 'Guardar cambios' : 'Agregar servicio'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {cargando && (
        <div className="py-8">
          <Spinner label="Cargando servicios..." />
        </div>
      )}

      {!cargando && servicios.length === 0 && !mostrarForm && (
        <EmptyState
          emoji="✂️"
          titulo="Todavía no tienes servicios"
          descripcion="Agrega el primero para poder venderlo desde Ventas."
        >
          <Button fullWidth={false} className="px-5 mx-auto" onClick={abrirCrear}>
            <Plus className="h-4 w-4" /> Agregar servicio
          </Button>
        </EmptyState>
      )}

      {!cargando && servicios.length > 0 && (
        <div className="flex flex-col gap-2">
          {servicios.map((s) => (
            <Card key={s.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-negro truncate">{s.nombre}</div>
                <div className="text-[12px] text-gris">
                  precio: {formatoCOP(s.precio)} · costo: {formatoCOP(s.costo)}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => abrirEditar(s)} className="p-2 rounded-lg text-gris hover:bg-arena" aria-label="Editar">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => eliminar(s)} className="p-2 rounded-lg text-rojo hover:bg-rojo-claro" aria-label="Borrar">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
