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
} from '@/lib/api';
import { formatoCOP } from '@/lib/formato';
import Alert from '@/components/ui/Alert';
import Spinner from '@/components/ui/Spinner';
import RegistrarVenta from '@/components/ventas/RegistrarVenta';
import KpisDia from '@/components/ventas/KpisDia';
import GraficoBarras7Dias from '@/components/ventas/GraficoBarras7Dias';
import TopProductos from '@/components/ventas/TopProductos';
import ListaVentas from '@/components/ventas/ListaVentas';

// Pantalla de Ventas (Fase 3).
//
// El orden importa: primero REGISTRAR (es lo que se usa cincuenta veces al día,
// con un cliente esperando) y después los números. Un dashboard bonito arriba
// obligaría a bajar cada vez que se vende algo.
//
// Ningún número se calcula aquí: los KPIs, el gráfico y el top 3 llegan ya
// resueltos de `GET /api/dashboard`, que los saca con SQL. Si un número se ve
// raro, se revisa la migración, no esta pantalla.
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

  const cargar = useCallback(async () => {
    setErrorPantalla('');
    try {
      // Las tres en paralelo: son independientes y así la pantalla no se siente
      // lenta por esperarlas en fila.
      const [inv, dash, lista] = await Promise.all([
        listarProductos(token),
        obtenerDashboard(token),
        listarVentas(token),
      ]);
      setProductos(inv.productos || []);
      setDashboard(dash);
      setVentas(lista.ventas || []);
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

  async function registrar(items) {
    setGuardando(true);
    setErrorRegistro('');
    try {
      await registrarVenta({ items }, token);
      // Se recarga todo: la venta cambió el stock, los KPIs y el gráfico a la vez.
      await cargar();
      return true;
    } catch (err) {
      // El mensaje del backend se muestra tal cual: ya viene en español y con el
      // nombre del producto ("Stock insuficiente de «Arroz 500g»: tienes 3…").
      setErrorRegistro(err instanceof ApiError ? err.message : 'No se pudo registrar la venta.');
      return false;
    } finally {
      setGuardando(false);
    }
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

  // Un producto con costo en 0 hace que la ganancia salga igual a la venta, o sea
  // inflada. Mejor avisarlo que mostrar un número que no es cierto.
  const sinCosto = productos.filter((p) => Number(p.costo) === 0).length;

  if (cargando) {
    return (
      <div className="py-10">
        <Spinner label="Cargando tus ventas..." />
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="font-display font-bold text-lg text-negro mb-1">Ventas</div>
        <div className="text-[13px] text-gris leading-relaxed">
          Registra lo que vendes y mira cómo va tu negocio.
        </div>
      </div>

      {demo && (
        <Alert tone="demo">
          Modo de ejemplo — estos números no son de tu negocio. Inicia sesión con una cuenta real
          (Supabase) para registrar ventas de verdad.
        </Alert>
      )}

      {errorPantalla && <Alert tone="error">{errorPantalla}</Alert>}

      <RegistrarVenta
        productos={productos}
        guardando={guardando}
        error={errorRegistro}
        onRegistrar={registrar}
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
      />
    </>
  );
}
