/*frontend/src/components/ventas/ClientePicker.jsx */

'use client';

import { useMemo, useState } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// `onCrearCliente` es una función async inyectada por el padre (llama a la API
// con el token) que devuelve el cliente creado o lanza un ApiError. Este
// componente no sabe nada de tokens ni de la API — solo de UI.
export default function ClientePicker({ clientes, clienteId, onSeleccionar, onCrearCliente }) {
  const [busqueda, setBusqueda] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [telefonoNuevo, setTelefonoNuevo] = useState('');
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState('');

  const clienteSel = clientes.find((c) => c.id === clienteId) || null;

  const filtrados = useMemo(() => {
    const q = normalizar(busqueda);
    if (!q) return clientes;
    return clientes.filter((c) => normalizar(c.nombre).includes(q));
  }, [clientes, busqueda]);

  async function crear() {
    if (!nombreNuevo.trim()) return;
    setCreando(true);
    setError('');
    try {
      const cliente = await onCrearCliente({ nombre: nombreNuevo.trim(), telefono: telefonoNuevo.trim() || null });
      onSeleccionar(cliente.id);
      setMostrarForm(false);
      setNombreNuevo('');
      setTelefonoNuevo('');
      setBusqueda('');
    } catch (err) {
      setError(err?.message || 'No se pudo crear el cliente.');
    } finally {
      setCreando(false);
    }
  }

  // Cliente ya elegido: tarjeta compacta, igual patrón que el producto
  // seleccionado en RegistrarVenta.
  if (clienteSel) {
    return (
      <div>
        <label className="text-xs font-medium text-gris mb-1.5 block">Cliente</label>
        <div className="flex items-center gap-2.5 p-3 rounded-xl border-[1.5px] border-verde bg-verde-claro">
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-negro truncate">{clienteSel.nombre}</div>
            {clienteSel.telefono && <div className="text-[11px] text-gris">{clienteSel.telefono}</div>}
          </div>
          <button type="button" onClick={() => onSeleccionar(null)} className="text-gris" aria-label="Cambiar cliente">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="text-xs font-medium text-gris mb-1.5 block">Cliente</label>

      {!mostrarForm && (
        <>
          <div className="relative">
            <Search className="h-4 w-4 text-gris absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar cliente…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-3 rounded-xl border-[1.5px] border-borde bg-white text-[15px] text-negro outline-none transition focus:border-verde"
            />
          </div>

          <div className="flex flex-col gap-1.5 mt-2 max-h-40 overflow-y-auto">
            {filtrados.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSeleccionar(c.id)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border-[1.5px] border-borde bg-white text-left transition hover:border-verde-suave"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-negro truncate">{c.nombre}</div>
                  {c.telefono && <div className="text-[11px] text-gris">{c.telefono}</div>}
                </div>
              </button>
            ))}
            {filtrados.length === 0 && (
              <div className="text-[12px] text-gris text-center py-3">Ningún cliente coincide.</div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setMostrarForm(true);
              setNombreNuevo(busqueda);
            }}
            className="flex items-center gap-1.5 text-[12px] text-verde font-medium mt-2"
          >
            <UserPlus className="h-3.5 w-3.5" /> Crear cliente nuevo
          </button>
        </>
      )}

      {mostrarForm && (
        <div className="flex flex-col gap-2.5 p-3 rounded-xl border-[1.5px] border-borde bg-white">
          <Input
            label="Nombre del cliente"
            placeholder="Ej. Don Jairo"
            value={nombreNuevo}
            onChange={(e) => setNombreNuevo(e.target.value)}
            autoFocus
          />
          <Input
            label="Teléfono (opcional)"
            placeholder="Ej. 300 123 4567"
            value={telefonoNuevo}
            onChange={(e) => setTelefonoNuevo(e.target.value)}
          />
          {error && <Alert tone="error">{error}</Alert>}
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => setMostrarForm(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              className="flex-1"
              loading={creando}
              disabled={!nombreNuevo.trim()}
              onClick={crear}
            >
              Crear y elegir
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
