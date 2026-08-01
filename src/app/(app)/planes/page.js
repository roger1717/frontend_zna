'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { iniciarPago } from '@/lib/api';
import { PLANES } from '@/lib/constants';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

// Wompi "Web Checkout" (redirect) — no necesita incrustar ningún widget
// ni script de terceros, solo arma la URL con los datos firmados que
// devuelve /api/pago/iniciar y redirige. Ver docs.wompi.co.
function urlCheckoutWompi({ referencia, montoCentavos, moneda, firmaIntegridad, llavePublica }) {
  const params = new URLSearchParams({
    'public-key': llavePublica,
    currency: moneda,
    'amount-in-cents': String(montoCentavos),
    reference: referencia,
    'signature:integrity': firmaIntegridad,
  });
  return `https://checkout.wompi.co/p/?${params.toString()}`;
}

export default function PlanesPage() {
  const { token } = useAuth();
  const [cargando, setCargando] = useState(null);
  const [error, setError] = useState('');

  async function elegirPlan(planId) {
    setError('');
    setCargando(planId);
    try {
      const datos = await iniciarPago(planId, token);
      if (!datos.llavePublica) {
        throw new Error('Los pagos todavía no están conectados — falta configurar la llave pública de Wompi.');
      }
      window.location.href = urlCheckoutWompi(datos);
    } catch (err) {
      setError(err.message || 'No se pudo iniciar el pago.');
    } finally {
      setCargando(null);
    }
  }

  return (
    <>
      <div>
        <div className="font-display font-bold text-lg text-negro mb-1">Planes y pagos</div>
        <div className="text-[13px] text-gris leading-relaxed">Elige el plan que mejor se ajusta a tu negocio.</div>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <div className="flex flex-col gap-3">
        {PLANES.map((plan) => (
          <Card
            key={plan.id}
            className={plan.destacado ? 'border-verde border-[1.5px] relative' : 'relative'}
          >
            {plan.destacado && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-verde text-white text-[9px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                Más elegido
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
              {plan.caracteristicas.map((c) => (
                <div key={c} className="flex items-start gap-2 text-[12px] text-negro">
                  <Check className="h-3.5 w-3.5 text-verde flex-shrink-0 mt-0.5" />
                  {c}
                </div>
              ))}
            </div>
            {plan.id === 'gratis' ? (
              <div className="text-center text-[12px] text-gris py-2">Tu plan al crear la cuenta</div>
            ) : (
              <Button
                variant={plan.destacado ? 'dark' : 'outline'}
                loading={cargando === plan.id}
                onClick={() => elegirPlan(plan.id)}
              >
                Elegir {plan.nombre}
              </Button>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
