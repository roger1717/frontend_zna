

// frontend/src/app/(app)/ventas/page.js
'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  anularVenta,
  listarProductos,
  listarVentas,
  obtenerDashboard,
  registrarVenta,
  ApiError,
  listarClientes,
  crearCliente,
  marcarVentaPagada
} from '@/lib/api';
import { formatoCOP } from '@/lib/formato';
import Alert from '@/components/ui/Alert';
import Spinner from '@/components/ui/Spinner';
import RegistrarVenta from '@/components/ventas/RegistrarVenta';
import KpisDia from '@/components/ventas/KpisDia';
import GraficoBarras7Dias from '@/components/ventas/GraficoBarras7Dias';
import TopProductos from '@/components/ventas/TopProductos';
import ListaVentas from '@/components/ventas/ListaVentas';
import { listarServicios } from '@/lib/api';

export default function VentasPage() {
  const { token } = useAuth();

  const [productos, setProductos] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [demo, setDemo] = useState(false);

  const [errorRegistro, setErrorRegistro] = useState('');
  const [errorPantalla, setErrorPantalla] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [anulandoId, setAnulandoId] = useState(null);

  const [clientes, setClientes] = useState([]);
  const [marcandoPagoId, setMarcandoPagoId] = useState(null);
  const [servicios, setServicios] = useState([]);

  const cargar = useCallback(async () => {
    setErrorPantalla('');
    try {
      const [inv, dash, lista, clientesRes, serviciosRes] = await Promise.all([
        listarProductos(token),
        obtenerDashboard(token),
        listarVentas(token),
        listarClientes(token),
        listarServicios(token),
      ]);
      setProductos(inv.productos || []);
      setDashboard(dash);
      setVentas(lista.ventas || []);
      setClientes(clientesRes.clientes || []);
      setServicios(serviciosRes.servicios || []);
      setDemo(Boolean(dash.demo));
    } catch {
      setErrorPantalla('No se pudieron cargar tus ventas. Revisa tu conexión e intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function registrar(payload) {
    setGuardando(true);
    setErrorRegistro('');
    try {
      await registrarVenta(payload, token);
      await cargar();
      return true;
    } catch (err) {
      setErrorRegistro(err instanceof ApiError ? err.message : 'No se pudo registrar la venta.');
      return false;
    } finally {
      setGuardando(false);
    }
  }

  async function marcarPagada(venta) {
    setMarcandoPagoId(venta.id);
    setErrorPantalla('');
    try {
      await marcarVentaPagada(venta.id, token);
      await cargar();
    } catch (err) {
      setErrorPantalla(err instanceof ApiError ? err.message : 'No se pudo marcar la venta como pagada.');
    } finally {
      setMarcandoPagoId(null);
    }
  }
  
  async function crearClienteDesdeVenta(payload) {
    const cliente = await crearCliente(payload, token);
    setClientes((prev) => [...prev, cliente].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    return cliente;
  }

  async function anular(venta) {
    if (!confirm(`¿Anular esta venta de ${formatoCOP(venta.total)}? El stock vuelve a tu inventario.`)) return;
    setAnulandoId(venta.id);
    setErrorPantalla('');
    try {
      await anularVenta(venta.id, token);
      await cargar();
    } catch (err) {
      setErrorPantalla(err instanceof ApiError ? err.message : 'No se pudo anular la venta.');
    } finally {
      setAnulandoId(null);
    }
  }

  const sinCosto = productos.filter((p) => Number(p.costo) === 0).length;

  if (cargando) {
    return (
      <div className="py-10">
        <Spinner label="Cargando tus ventas..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="font-display font-bold text-lg text-negro mb-1">Ventas</div>
        <div className="text-[13px] text-gris leading-relaxed">
          Registra lo que vendes y mira cómo va tu negocio.
        </div>
      </div>

      {demo && (
        <Alert tone="demo">
          Modo de ejemplo — estos números no son de tu negocio. Inicia sesión con una cuenta real
          para registrar ventas de verdad.
        </Alert>
      )}

      {errorPantalla && <Alert tone="error">{errorPantalla}</Alert>}

      <RegistrarVenta
        productos={productos}
        servicios={servicios}
        clientes={clientes}
        guardando={guardando}
        error={errorRegistro}
        onRegistrar={registrar}
        onCrearCliente={crearClienteDesdeVenta}
      />

      {sinCosto > 0 && (
        <Alert tone="warn">
          {sinCosto === 1
            ? 'Hay 1 producto sin costo registrado, así que su ganancia aparece igual a la venta.'
            : `Hay ${sinCosto} productos sin costo registrado, así que su ganancia aparece igual a la venta.`}{' '}
          <Link href="/inventario" className="font-semibold underline">
            Completa los costos en Inventario
          </Link>{' '}
          para ver tu ganancia real.
        </Alert>
      )}

      <KpisDia kpis={dashboard?.kpis} demo={demo} />

      <GraficoBarras7Dias serie={dashboard?.serie_7_dias || []} />

      <TopProductos productos={dashboard?.top_productos || []} />

      <ListaVentas
        ventas={ventas}
        zonaHoraria={dashboard?.zona_horaria}
        anulandoId={anulandoId}
        onAnular={anular}
        marcandoPagoId={marcandoPagoId} 
        onMarcarPagada={marcarPagada} 
      />
    </div>
  );
}