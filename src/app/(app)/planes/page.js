// frontend/src/app/(app)/planes/page.js
'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { iniciarPago, obtenerCatalogoPlanes, obtenerPerfil, ApiError } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

// Carga dinámica del Widget de pago de Wompi (una sola vez).
function cargarScriptWompi() {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.Widget) return resolve(window.Widget);
    const s = document.createElement('script');
    s.src = 'https://checkout.wompi.co/v1/widget.js';
    s.async = true;
    s.onload = () =>
      window.Widget ? resolve(window.Widget) : reject(new Error('No se pudo cargar el widget de pago.'));
    s.onerror = () => reject(new Error('No se pudo cargar el widget de pago.'));
    document.head.appendChild(s);
  });
}

export default function PlanesPage() {
  const { token } = useAuth();
  const [planes, setPlanes] = useState([]);
  const [profile, setProfile] = useState(null);
  const [cargando, setCargando] = useState(null);
  const [error, setError] = useState('');
  const [cargandoPlanes, setCargandoPlanes] = useState(true);

  useEffect(() => {
    if (!token) {
      setCargandoPlanes(false);
      return;
    }
    Promise.all([
      obtenerCatalogoPlanes(token),
      obtenerPerfil(token).then((data) => data.perfil || null),
    ])
      .then(([lista, perfil]) => {
        setPlanes(lista);
        setProfile(perfil);
        setCargandoPlanes(false);
      })
      .catch(() => {
        setError('No se pudieron cargar los planes. Intenta de nuevo.');
        setCargandoPlanes(false);
      });
  }, [token]);

  async function abrirWidget(checkout) {
    const Widget = await cargarScriptWompi();
    const widget = new Widget({
      target: 'zonapp-widget',
      publicKey: checkout.publicKey,
      currency: checkout.currency,
      amountInCents: checkout.amountInCents,
      reference: checkout.reference,
      signature: { integrity: checkout.signatureIntegrity },
      redirectUrl: checkout.redirectUrl,
      customerEmail: checkout.customerEmail,
      sandbox: checkout.sandbox,
    });
    widget.open();
  }

  async function elegirPlan(planId) {
    setError('');
    setCargando(planId);
    try {
      const datos = await iniciarPago(planId, token);
      const checkout = datos?.checkout;
      if (!checkout) {
        throw new ApiError('Pagos no disponibles todavía.', 503);
      }
      // Cuando el backend tenga claves de Wompi, esto abre el Widget de pago.
      await abrirWidget(checkout);
    } catch (err) {
      if (err instanceof ApiError && err.status === 503) {
        setError(
          '⏳ Pagos próximamente: estamos esperando las claves de Wompi del cliente. Tu plan actual sigue activo.'
        );
      } else {
        setError(err.message || 'No se pudo iniciar el pago.');
      }
    } finally {
      setCargando(null);
    }
  }

  // Mostrar badge de tokens si hay información disponible
  function TokenBadge() {
    if (!profile?.tokens || profile.tokens.limite === 0) return null;
    const { usados, limite } = profile.tokens;
    const porcentaje = Math.round((usados / limite) * 100);
    const tono = porcentaje >= 90 ? 'bg-rojo' : porcentaje >= 70 ? 'bg-amarillo' : 'bg-gris';
    const texto = porcentaje >= 90 ? 'text-rojo' : porcentaje >= 70 ? 'text-amarillo' : 'text-gris';

    return (
      <div className="flex items-center gap-2 mb-4 p-3 bg-gris rounded-md">
        <div className="text-sm font-semibold text-negro">Tokens:</div>
        <div className="text-sm font-bold text-negro">{usados}</div>
        <div className="text-sm text-gris">/</div>
        <div className="text-sm text-gris">{limite}</div>
        <div className="text-sm font-medium text-negro">{porcentaje}%</div>
        <div className={`flex-1 h-1.5 rounded-full ${tono}`}>
          <div
            className={`h-1.5 rounded-full ${texto}`}
            style={{ width: `${Math.min(porcentaje, 100)}%` }}
          />
        </div>
      </div>
    );
  }

  if (cargandoPlanes) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gris">Cargando planes...</div>
      </div>
    );
  }

  if (!planes || planes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gris">No hay planes disponibles.</p>
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="font-display font-bold text-lg text-negro mb-1">Planes y pagos</div>
        <div className="text-[13px] text-gris leading-relaxed">
          Elige el plan que mejor se adapte a tus necesidades.
        </div>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {profile && <TokenBadge />}

      <div className="flex flex-col gap-3">
        {planes.map((plan) => (
          <Card
            key={plan.id}
            className={plan.destacado ? 'border-verde border-[1.5px] relative' : 'relative'}
          >
            {plan.destacado && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-verde text-white text-[9px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                {plan.id === 'pro' ? 'Hasta Pro' : 'Recomendado'}
              </div>
            )}
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-[15px] font-bold text-negro font-display">{plan.nombre}</span>
              <span className="text-lg font-bold text-verde">
                {plan.precio}
                <span className="text-[11px] text-gris font-normal">{plan.periodo}</span>
              </span>
            </div>
            <div className="text-xs text-gris mb-3">{plan.descripcion}</div>
            <div className="flex flex-col gap-1.5 mb-4">
              {plan.caracteristicas &&
                plan.caracteristicas.map((car) => (
                  <div key={car} className="flex items-start gap-2 text-[12px] text-negro">
                    <Check className="h-3.5 w-3.5 text-verde flex-shrink-0 mt-0.5" />
                    {car}
                  </div>
                ))}
            </div>
            {plan.precio === '$0' || plan.id === 'free' ? (
              <div className="text-center text-[12px] text-gris py-2">Tu plan al crear la cuenta</div>
            ) : (
              <Button
                variant={plan.destacado ? 'dark' : 'outline'}
                loading={cargando === plan.id}
                onClick={() => elegirPlan(plan.id)}
                disabled={!token}
              >
                {!token ? 'Inicia sesión para elegir' : plan.id === 'pro' ? 'Pagar y activar Pro' : `Elegir ${plan.nombre}`}
              </Button>
            )}
          </Card>
        ))}
      </div>

      {/* Wompi inserta su widget aquí cuando hay planes de pago */}
      <div id="zonapp-widget" className="hidden" />
    </>
  );
}

