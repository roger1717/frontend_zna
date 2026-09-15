// RUTA DEL ARCHIVO: frontend/src/app/(app)/gastos/page.js
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Pencil, X, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { listarGastos, crearGasto, editarGasto, borrarGasto, ApiError } from '@/lib/api';
import { CATEGORIAS_GASTO } from '@/lib/constants';
import { formatoCOP } from '@/lib/formato';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';

// Emoji por categoría para la lista — el backend guarda el id; aquí solo se
// traduce a algo legible (mismo patrón que emojiSector en constants.js).
const EMOJI_CATEGORIA = {
  arriendo: '🏠',
  servicios_publicos: '💡',
  insumos: '🧺',
  transporte: '🚌',
  nomina: '👥',
  otro: '📋',
};

function nombreCategoria(id) {
  return CATEGORIAS_GASTO.find((c) => c.id === id)?.nombre ?? 'Otro';
}

function hoyLocal() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

const FORM_VACIO = { concepto: '', monto: '', categoria: 'otro', nota: '', ocurrido_en: hoyLocal() };

export default function GastosPage() {
  const { token } = useAuth();

  const [gastos, setGastos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargar();
  }, [token]);

  async function cargar() {
    setCargando(true);
    try {
      const { gastos: lista } = await listarGastos(token);
      setGastos(lista || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los gastos.');
    } finally {
      setCargando(false);
    }
  }

  // Total del mes en curso: sumamos `monto` de los gastos con fecha en el mes
  // actual (ocurrido_en; si falta, created_at).
  const resumenMes = useMemo(() => {
    const ahora = new Date();
    const delMes = (gastos || []).filter((g) => {
      const f = new Date(g.ocurrido_en || g.created_at);
      return !Number.isNaN(f.getTime()) && f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear();
    });
    return {
      total: delMes.reduce((suma, g) => suma + Number(g.monto || 0), 0),
      cantidad: delMes.length,
    };
  }, [gastos]);

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function abrirCrear() {
    setEditandoId(null);
    setError('');
    setForm(FORM_VACIO);
    setMostrarForm(true);
  }

  function abrirEditar(gasto) {
    setEditandoId(gasto.id);
    setError('');
    setForm({
      concepto: gasto.concepto || '',
      monto: String(gasto.monto ?? ''),
      categoria: gasto.categoria || 'otro',
      nota: gasto.nota || '',
      ocurrido_en: (gasto.ocurrido_en || '').slice(0, 10),
    });
    setMostrarForm(true);
  }

  function cerrarForm() {
    setMostrarForm(false);
    setEditandoId(null);
    setError('');
  }

  async function guardar(e) {
    e.preventDefault();
    const monto = Number(form.monto);
    if (!form.concepto.trim()) {
      setError('Escribe el concepto del gasto.');
      return;
    }
    if (!Number.isFinite(monto) || monto <= 0) {
      setError('El valor debe ser un número mayor a 0.');
      return;
    }

    const payload = {
      concepto: form.concepto.trim(),
      monto,
      categoria: form.categoria,
      nota: form.nota.trim() || undefined,
      ocurrido_en: form.ocurrido_en || undefined,
    };

    setGuardando(true);
    setError('');
    try {
      if (editandoId) {
        await editarGasto(editandoId, payload, token);
      } else {
        await crearGasto(payload, token);
      }
      cerrarForm();
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar el gasto.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(gasto) {
    if (!confirm(`¿Eliminar el gasto "${gasto.concepto}"?`)) return;
    setError('');
    try {
      await borrarGasto(gasto.id, token);
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el gasto.');
    }
  }

  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-display font-bold text-lg text-negro mb-1">Gastos</div>
          <div className="text-[13px] text-gris leading-relaxed">
            Lleva el día a día de tus egresos.
          </div>
        </div>
        {!mostrarForm && (
          <Button fullWidth={false} size="sm" className="px-3 flex-shrink-0" onClick={abrirCrear}>
            <Plus className="h-4 w-4" /> Nuevo
          </Button>
        )}
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {!cargando && gastos.length > 0 && (
        <Card className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-verde-claro flex items-center justify-center flex-shrink-0">
            <Wallet className="h-5 w-5 text-verde" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-gris mb-0.5">Gastos de este mes</div>
            <div className="font-display font-bold text-[20px] text-negro leading-none">
              {formatoCOP(resumenMes.total)}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-bold font-display text-verde">{resumenMes.cantidad}</div>
            <div className="text-[10px] text-gris">registros</div>
          </div>
        </Card>
      )}

      {mostrarForm && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-semibold text-negro">
              {editandoId ? 'Editar gasto' : 'Nuevo gasto'}
            </span>
            <button onClick={cerrarForm} className="text-gris" aria-label="Cerrar">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form className="flex flex-col gap-3" onSubmit={guardar}>
            <Input
              label="Concepto"
              placeholder="Ej. Compra de mercado"
              value={form.concepto}
              onChange={(e) => actualizarCampo('concepto', e.target.value)}
              maxLength={120}
              autoFocus
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Valor"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                placeholder="0"
                value={form.monto}
                onChange={(e) => actualizarCampo('monto', e.target.value)}
              />
              <div>
                <label className="block text-xs font-medium text-gris mb-1.5">Fecha</label>
                <input
                  type="date"
                  value={form.ocurrido_en}
                  onChange={(e) => actualizarCampo('ocurrido_en', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-borde bg-white text-[15px] text-negro outline-none transition focus:border-verde"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gris mb-1.5">Categoría</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIAS_GASTO.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => actualizarCampo('categoria', c.id)}
                    className={`px-3 py-1.5 rounded-full border-[1.5px] text-[12px] font-medium transition ${
                      form.categoria === c.id
                        ? 'bg-verde border-verde text-white'
                        : 'bg-white border-borde text-gris hover:border-verde-suave'
                    }`}
                  >
                    {EMOJI_CATEGORIA[c.id]} {c.nombre}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Nota (opcional)"
              placeholder="Un detalle que quieras recordar"
              value={form.nota}
              onChange={(e) => actualizarCampo('nota', e.target.value)}
              maxLength={200}
            />

            <div className="flex gap-2">
              <Button variant="outline" onClick={cerrarForm}>
                Cancelar
              </Button>
              <Button loading={guardando} onClick={guardar}>
                {editandoId ? 'Guardar cambios' : 'Agregar gasto'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {cargando && (
        <div className="py-8">
          <Spinner label="Cargando gastos..." />
        </div>
      )}

      {!cargando && gastos.length === 0 && !mostrarForm && (
        <EmptyState
          emoji="🧾"
          titulo="Aún no registras gastos"
          descripcion="Lleva el control de tus egresos — arriendo, insumos, transporte y más."
        >
          <Button fullWidth={false} className="px-5 mx-auto" onClick={abrirCrear}>
            <Plus className="h-4 w-4" /> Registrar primer gasto
          </Button>
        </EmptyState>
      )}

      {!cargando && gastos.length > 0 && (
        <div className="flex flex-col gap-2">
          {gastos.map((g) => (
            <Card key={g.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-negro truncate mb-0.5">{g.concepto}</div>
                <div className="text-[12px] text-gris">
                  {EMOJI_CATEGORIA[g.categoria ?? 'otro']} {nombreCategoria(g.categoria)}
                  {g.nota ? ` · ${g.nota}` : ''}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-[14px] font-semibold text-negro">{formatoCOP(g.monto)}</div>
                <div className="text-[10px] text-gris">{fechaCorta(g.ocurrido_en || g.created_at)}</div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => abrirEditar(g)}
                  className="p-2 rounded-lg text-gris hover:bg-arena"
                  aria-label="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => eliminar(g)}
                  className="p-2 rounded-lg text-rojo hover:bg-rojo-claro"
                  aria-label="Eliminar"
                >
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

function fechaCorta(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
}
