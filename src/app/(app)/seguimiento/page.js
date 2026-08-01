'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { obtenerResumenSeguimiento, registrarSeguimiento, ApiError } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Spinner from '@/components/ui/Spinner';

// Las mismas 3 preguntas y la misma fórmula del backend (src/routes/
// seguimiento.js) — "aritmética determinística, cero IA" — así el modo
// demo puede mostrar un resumen coherente sin depender del servidor.
const PREGUNTAS = [
  { clave: 'ventas', texto: '¿Cuánto vendiste hoy?', placeholder: 'Ej. 185000' },
  { clave: 'clientesAtendidos', texto: '¿A cuántos clientes atendiste hoy?', placeholder: 'Ej. 12' },
  { clave: 'gastosMercancia', texto: '¿Cuánto gastaste en mercancía hoy?', placeholder: 'Ej. 60000' },
];

function calcularLocal({ ventas, clientesAtendidos, gastosMercancia }) {
  const ventasAyerDemo = ventas * 0.92; // línea base solo para el ejemplo en modo demo
  return {
    ticketPromedio: clientesAtendidos > 0 ? Math.round(ventas / clientesAtendidos) : null,
    variacionVentasPct: Math.round(((ventas - ventasAyerDemo) / ventasAyerDemo) * 1000) / 10,
    gananciaEstimada: ventas - gastosMercancia,
  };
}

function formatoCOP(valor) {
  return valor == null ? '—' : `$${Math.round(valor).toLocaleString('es-CO')}`;
}

export default function SeguimientoPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [cargando, setCargando] = useState(true);
  const [bloqueado, setBloqueado] = useState(false);
  const [resumen, setResumen] = useState(null);
  const [demo, setDemo] = useState(false);

  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [valorActual, setValorActual] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarResumen();
  }, [token]);

  async function cargarResumen() {
    setCargando(true);
    setBloqueado(false);
    try {
      const r = await obtenerResumenSeguimiento(token);
      setResumen(r);
      setDemo(r.demo);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setBloqueado(true);
      } else {
        setError('No se pudo cargar tu seguimiento diario.');
      }
    } finally {
      setCargando(false);
    }
  }

  function siguientePaso() {
    const valor = parseFloat(valorActual);
    if (!Number.isFinite(valor) || valor < 0) {
      setError('Ingresa un número válido, mayor o igual a 0.');
      return;
    }
    setError('');
    const clave = PREGUNTAS[paso].clave;
    const nuevasRespuestas = { ...respuestas, [clave]: valor };
    setRespuestas(nuevasRespuestas);
    setValorActual('');

    if (paso < PREGUNTAS.length - 1) {
      setPaso(paso + 1);
    } else {
      enviar(nuevasRespuestas);
    }
  }

  async function enviar(datos) {
    setEnviando(true);
    setError('');
    try {
      const r = await registrarSeguimiento(
        {
          ventas: datos.ventas,
          clientes_atendidos: Math.round(datos.clientesAtendidos),
          gastos_mercancia: datos.gastosMercancia,
        },
        token
      );

      if (r.demo) {
        // Sin backend real disponible — calculamos el resumen aquí mismo
        // con la misma fórmula, para que el modo demo se vea completo.
        setResumen({
          registrado: true,
          hoy: datos,
          ventasAyer: null,
          calculado: calcularLocal(datos),
          demo: true,
        });
        setDemo(true);
      } else {
        await cargarResumen();
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setBloqueado(true);
      } else {
        setError(err.message || 'No se pudo guardar tu registro de hoy.');
      }
    } finally {
      setEnviando(false);
    }
  }

  function reiniciarRegistro() {
    setPaso(0);
    setRespuestas({});
    setValorActual('');
    setResumen((r) => ({ ...r, registrado: false }));
  }

  if (cargando) {
    return (
      <div className="py-10">
        <Spinner label="Cargando tu seguimiento diario..." />
      </div>
    );
  }

  if (bloqueado) {
    return (
      <>
        <div className="font-display font-bold text-lg text-negro">Seguimiento diario</div>
        <Alert tone="warn">
          Seguimiento diario es exclusivo de los planes <strong>Pro individual</strong> y <strong>Equipo</strong> —
          incluye registro diario de ventas, ticket promedio y más. El plan Gratis no lo incluye.
        </Alert>
        <Button variant="dark" onClick={() => router.push('/planes')}>
          🚀 Ver planes
        </Button>
      </>
    );
  }

  const yaRegistroHoy = resumen?.registrado;

  return (
    <>
      <div>
        <div className="font-display font-bold text-lg text-negro mb-1">Seguimiento diario</div>
        <div className="text-[13px] text-gris leading-relaxed">
          Registra tu día en menos de 1 minuto — es la base de tu historial de negocio.
        </div>
      </div>

      {demo && <Alert tone="demo">Datos de ejemplo — conecta tu cuenta y plan Pro/Equipo reales para guardar tu historial de verdad.</Alert>}

      {error && <Alert tone="error">{error}</Alert>}

      {!yaRegistroHoy && (
        <Card>
          <div className="text-[11px] text-gris mb-3">
            Pregunta {paso + 1} de {PREGUNTAS.length}
          </div>
          <div className="bg-verde rounded-2xl rounded-bl-md px-4 py-3 mb-4 max-w-[85%]">
            <div className="text-[13px] text-white">{PREGUNTAS[paso].texto}</div>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="decimal"
              min="0"
              autoFocus
              value={valorActual}
              onChange={(e) => setValorActual(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && siguientePaso()}
              placeholder={PREGUNTAS[paso].placeholder}
              className="flex-1 px-4 py-3 rounded-xl border-[1.5px] border-borde bg-white text-[15px] outline-none focus:border-verde"
            />
            <Button fullWidth={false} className="px-5" loading={enviando} onClick={siguientePaso}>
              {paso < PREGUNTAS.length - 1 ? 'Siguiente' : 'Guardar'}
            </Button>
          </div>
        </Card>
      )}

      {yaRegistroHoy && (
        <>
          <Alert tone="info">Ya registraste tu día de hoy. Estos son tus números:</Alert>

          <div className="grid grid-cols-2 gap-2.5">
            <Card className="border-l-[3px] border-l-verde">
              <div className="text-[10px] text-gris uppercase tracking-wide mb-0.5">Ventas de hoy</div>
              <div className="text-lg font-semibold text-negro">{formatoCOP(resumen.hoy.ventas)}</div>
            </Card>
            <Card className="border-l-[3px] border-l-azul">
              <div className="text-[10px] text-gris uppercase tracking-wide mb-0.5">Ticket promedio</div>
              <div className="text-lg font-semibold text-negro">{formatoCOP(resumen.calculado.ticketPromedio)}</div>
            </Card>
            <Card className="border-l-[3px] border-l-ambar">
              <div className="text-[10px] text-gris uppercase tracking-wide mb-0.5">Variación vs. ayer</div>
              <div className="flex items-center gap-1 text-lg font-semibold text-negro">
                {resumen.calculado.variacionVentasPct == null ? (
                  <>
                    <Minus className="h-4 w-4 text-gris" /> —
                  </>
                ) : resumen.calculado.variacionVentasPct >= 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-verde-suave" />
                    <span className="text-verde-suave">+{resumen.calculado.variacionVentasPct}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-rojo" />
                    <span className="text-rojo">{resumen.calculado.variacionVentasPct}%</span>
                  </>
                )}
              </div>
            </Card>
            <Card className="border-l-[3px] border-l-verde-suave">
              <div className="text-[10px] text-gris uppercase tracking-wide mb-0.5">Ganancia estimada</div>
              <div className="text-lg font-semibold text-negro">{formatoCOP(resumen.calculado.gananciaEstimada)}</div>
            </Card>
          </div>

          <Button variant="outline" onClick={reiniciarRegistro}>
            ✏️ Corregir el registro de hoy
          </Button>
        </>
      )}
    </>
  );
}
