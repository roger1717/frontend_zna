// frontend/src/app/(app)/chat/page.js
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Send, RotateCw, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { enviarMensajeChatbot, ApiError } from '@/lib/api';

// Preguntas de arranque: le enseñan al usuario qué SÍ sabe responder el bot
// (solo lectura de sus datos + ayuda de uso). Coinciden con las intenciones que
// el backend clasifica en la Fase 4.4.
const SUGERENCIAS = [
  '¿Cómo va mi negocio?',
  '¿Quién me debe plata?',
  '¿Qué se me está agotando?',
  '¿Qué debería comprar?',
  '¿Cuál es mi producto más vendido?',
  '¿Cómo registro una venta?',
];

// Cómo se muestra el origen de cada respuesta (regla de honestidad: el usuario
// siempre sabe si es un dato real de su negocio, ayuda de la app o un aviso).
const FUENTE = {
  real: { texto: 'Datos de tu negocio', clase: 'bg-verde-claro text-verde' },
  app: { texto: 'Ayuda de ZonaApp', clase: 'bg-azul-claro text-azul-oscuro' },
  sistema: { texto: 'Asistente', clase: 'bg-arena text-gris' },
  ia: { texto: 'Estimación de IA', clase: 'bg-ia-fondo text-ia' },
};

function mensajeDeError(err) {
  if (!(err instanceof ApiError)) return 'Ocurrió un error inesperado. Intenta de nuevo.';
  if (err.status === 0) return 'No hay conexión. Revisa tu internet e intenta de nuevo.';
  if (err.status === 401) return 'Tu sesión venció. Te llevaremos a iniciar sesión.';
  if (err.status === 429) return 'Estás enviando mensajes muy rápido. Espera un momento e intenta de nuevo.';
  if (err.status === 400) return err.message;
  return 'El asistente tuvo un problema. Intenta de nuevo en un momento.';
}

export default function ChatPage() {
  const { token } = useAuth();
  // Cada item: { rol: 'usuario' | 'bot', texto, fuente?, accion?, error? }
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const finRef = useRef(null);

  // Auto-scroll al último mensaje (o al indicador de "escribiendo").
  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, enviando]);

  async function preguntar(pregunta) {
    const limpio = pregunta.trim();
    if (!limpio || enviando) return; // Un solo envío a la vez: no duplica mensajes.

    setTexto('');
    setMensajes((prev) => [...prev, { rol: 'usuario', texto: limpio }]);
    setEnviando(true);

    try {
      const r = await enviarMensajeChatbot(limpio, token);
      setMensajes((prev) => [
        ...prev,
        { rol: 'bot', texto: r.respuesta, fuente: r.tipo_fuente, accion: r.accion_sugerida },
      ]);
    } catch (err) {
      setMensajes((prev) => [
        ...prev,
        { rol: 'bot', texto: mensajeDeError(err), error: true, reintento: limpio },
      ]);
    } finally {
      setEnviando(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    preguntar(texto);
  }

  const vacio = mensajes.length === 0;

  return (
    <div className="flex flex-col h-full -m-4">
      {/* Zona de mensajes (scroll propio) */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {vacio && (
          <div className="flex flex-col gap-4 mt-2">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-ia-fondo flex items-center justify-center mb-3">
                <Sparkles className="h-7 w-7 text-ia" />
              </div>
              <div className="font-display font-bold text-lg text-negro">Tu Gerente IA</div>
              <div className="text-[13px] text-gris leading-relaxed mt-1">
                Reviso tu cuaderno (ventas, inventario, gastos y créditos) y te respondo con tus
                datos reales. Si no lo sé, te lo digo con honestidad.
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGERENCIAS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => preguntar(s)}
                  className="text-left text-[13px] text-negro bg-white border border-borde rounded-full px-4 py-2.5 hover:border-ia hover:text-ia transition active:scale-[0.99]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {mensajes.map((m, i) =>
          m.rol === 'usuario' ? (
            <div key={i} className="self-end max-w-[85%] bg-verde text-white rounded-2xl rounded-br-md px-4 py-2.5 text-[14px] leading-relaxed">
              {m.texto}
            </div>
          ) : (
            <div key={i} className="self-start max-w-[90%] flex flex-col gap-1.5">
              <div
                className={`rounded-2xl rounded-bl-md px-4 py-3 text-[14px] leading-relaxed border ${
                  m.error ? 'bg-rojo-claro border-rojo text-negro' : 'bg-white border-borde text-negro'
                }`}
              >
                {!m.error && (
                  <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-ia mb-1">
                    <Sparkles className="h-3 w-3" />
                    Gerente IA
                  </div>
                )}
                {m.texto}
              </div>

              {!m.error && m.fuente && (
                <div className="flex items-center gap-2 flex-wrap px-1">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${(FUENTE[m.fuente] || FUENTE.sistema).clase}`}>
                    {(FUENTE[m.fuente] || FUENTE.sistema).texto}
                  </span>
                  {m.accion?.ruta && (
                    <Link href={m.accion.ruta} className="text-[11px] text-verde font-semibold">
                      {m.accion.etiqueta} →
                    </Link>
                  )}
                </div>
              )}

              {m.error && m.reintento && (
                <button
                  type="button"
                  onClick={() => preguntar(m.reintento)}
                  className="self-start flex items-center gap-1 text-[11px] text-verde font-semibold px-1"
                >
                  <RotateCw className="h-3 w-3" /> Reintentar
                </button>
              )}
            </div>
          )
        )}

        {enviando && (
          <div className="self-start bg-white border border-borde rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2.5">
            <span className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-ia/60 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 rounded-full bg-ia/60 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-2 rounded-full bg-ia/60 animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
            <span className="text-[12px] text-gris">Revisando tu cuaderno…</span>
          </div>
        )}

        <div ref={finRef} />
      </div>

      {/* Barra de escritura (fija arriba del BottomNav) */}
      <form onSubmit={onSubmit} className="flex-shrink-0 border-t border-borde bg-white p-3 flex items-center gap-2">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escríbele a tu gerente…"
          maxLength={1000}
          className="flex-1 px-4 py-2.5 rounded-full border-[1.5px] border-borde bg-arena text-[14px] text-negro outline-none focus:border-verde"
        />
        <button
          type="submit"
          disabled={enviando || !texto.trim()}
          aria-label="Enviar"
          className="flex-shrink-0 h-11 w-11 rounded-full bg-ambar text-ambar-texto flex items-center justify-center transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
