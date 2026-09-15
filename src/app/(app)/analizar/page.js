// frontend/src/app/(app)/analizar/page.js

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAnalysis } from '@/context/AnalysisContext';
import { analizarZona, autocompletarDirecciones, ApiError } from '@/lib/api';
import { SECTORES, RADIOS, SECTOR_PERSONALIZADO } from '@/lib/constants';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import SectorCard from '@/components/ui/SectorCard';
import Alert from '@/components/ui/Alert';
import SelectorMapa from '@/components/analisis/SelectorMapa';

// Clave para guardar en sessionStorage
const STORAGE_KEY = 'zonapp_ultimo_analisis';

// Clave pública de Google Maps (navegador). Se lee de frontend/.env.local —
// DEBE tener el prefijo NEXT_PUBLIC_ para existir en el cliente.
const GOOGLE_MAPS_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  process.env.NEXT_PUBLIC_GEOCODING_API_KEY ||
  process.env.NEXT_PUBLIC_PLACES_API_KEY ||
  '';

export default function AnalizarPage() {
  const { token } = useAuth();
  const { setUltimoAnalisis, setContexto } = useAnalysis();
  const router = useRouter();

  const [zona, setZona] = useState('');
  const [direccion, setDireccion] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [buscandoSugerencias, setBuscandoSugerencias] = useState(false);
  const [coordenadas, setCoordenadas] = useState(null); // lat/lng de la dirección elegida o del GPS
  const [sector, setSector] = useState('');
  const [nichoPersonalizado, setNichoPersonalizado] = useState('');
  // El radio por defecto sale del catálogo (plan de prueba: 200 m, fijo).
  const [radioMetros, setRadioMetros] = useState(RADIOS[0].metros);
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [selectorAbierto, setSelectorAbierto] = useState(false);

  // Al entrar al formulario, limpiar cualquier análisis previo
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Autocompletar la dirección (debounced) contra el backend de Google Places.
  useEffect(() => {
    if (!direccion.trim() || direccion.trim().length < 3 || coordenadas) {
      setSugerencias([]);
      return;
    }
    setBuscandoSugerencias(true);
    const timer = setTimeout(async () => {
      try {
        const sugs = await autocompletarDirecciones(direccion.trim(), token);
        setSugerencias(sugs);
      } catch {
        setSugerencias([]);
      } finally {
        setBuscandoSugerencias(false);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [direccion, coordenadas, token]);

  function elegirDireccion(s) {
    setDireccion(s.texto);
    setZona(s.texto);
    setCoordenadas({ lat: s.lat, lng: s.lng });
    setSugerencias([]);
  }

  function usarMiUbicacion() {
    setError('');
    if (!navigator.geolocation) {
      setError('Tu navegador no permite obtener la ubicación automáticamente. Usa la búsqueda de dirección.');
      return;
    }
    setBuscandoUbicacion(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordenadas({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSugerencias([]);
        setZona((prev) => (prev.trim() ? prev : 'Mi ubicación actual'));
        setBuscandoUbicacion(false);
      },
      () => {
        setError('No pudimos obtener tu ubicación. Busca la dirección en el campo de arriba.');
        setBuscandoUbicacion(false);
      }
    );
  }

  function abrirGoogleMaps() {
    const consulta = coordenadas
      ? `${coordenadas.lat},${coordenadas.lng}`
      : direccion.trim()
        ? encodeURIComponent(direccion.trim())
        : 'Bogotá, Colombia';
    window.open(`https://www.google.com/maps/search/?api=1&query=${consulta}`, '_blank');
  }

  // Si hay clave de navegador, se abre el selector de mapa interactivo; si no,
  // se abre Google Maps en otra pestaña (comportamiento anterior).
  function abrirSelectorMapa() {
    if (GOOGLE_MAPS_KEY) {
      setSelectorAbierto(true);
    } else {
      abrirGoogleMaps();
    }
  }

  function elegirDesdeMapa({ lat, lng, direccion: dir }) {
    const etiqueta = dir || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    setZona(etiqueta);
    setDireccion(etiqueta);
    setCoordenadas({ lat, lng });
    setSugerencias([]);
    setSelectorAbierto(false);
  }

  const nombreSectorElegido =
    sector === SECTOR_PERSONALIZADO
      ? nichoPersonalizado.trim() || 'Otro'
      : SECTORES.find((s) => s.id === sector)?.nombre;

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');

    if (!zona.trim()) return setError('Busca y elige una dirección para el análisis.');
    if (!sector) return setError('Selecciona un tipo de negocio.');
    if (sector === SECTOR_PERSONALIZADO && !nichoPersonalizado.trim()) {
      return setError('Escribe el nicho de negocio (ej. barbería canina, taller de costura).');
    }

    const payload = {
      zona: zona.trim(),
      sector,
      radio_metros: radioMetros,
    };
    // Si el cliente eligió una dirección (búsqueda) o usó el GPS, mandamos las
    // coordenadas; si no, el backend geocodifica la zona por texto.
    if (coordenadas) payload.coordenadas = coordenadas;
    // Nicho libre: el backend lo busca por texto en Google Places.
    if (sector === SECTOR_PERSONALIZADO) {
      payload.nicho_personalizado = nichoPersonalizado.trim();
    }

    setCargando(true);
    try {
      const resultado = await analizarZona(payload, token);

      // El backend devuelve el sector legible (id o el texto del nicho) y el
      // radio real usado; lo propagamos al resultado e historial.
      const sectorLegible = resultado.sector || sector;
      const radioUsado = resultado.radio_metros_usado || radioMetros;
      const contexto = { zona: zona.trim(), sector: sectorLegible, radioMetros: radioUsado };

      // Guardar en sessionStorage para recuperar al recargar /resultado
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ analisis: resultado, contexto }));
      }

      setUltimoAnalisis(resultado);
      setContexto(contexto);
      router.push('/analizar/resultado');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo generar el análisis.');
    } finally {
      setCargando(false);
    }
  }

  const urlGoogleMaps = coordenadas
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        direccion || `${coordenadas.lat},${coordenadas.lng}`
      )}`
    : null;

  return (
    <>
      <div>
        <div className="font-display font-bold text-lg text-negro mb-1">Analiza tu zona</div>
        <div className="text-[13px] text-gris leading-relaxed">
          Elige la dirección exacta donde está (o estará) tu negocio y te mostramos su mercado cercano.
        </div>
      </div>

      <form onSubmit={manejarSubmit} className="flex flex-col gap-3">
        <div>
          <Input
            label="📍 Dirección exacta"
            placeholder="Busca calle, carrera o barrio · Ej. Cra 15 # 93-33, Bogotá"
            value={direccion}
            onChange={(e) => {
              setDireccion(e.target.value);
              setZona(e.target.value);
              setCoordenadas(null); // el usuario está corrigiendo la dirección
            }}
          />

          {buscandoSugerencias && (
            <div className="text-[12px] text-gris mt-1.5">Buscando direcciones…</div>
          )}

          {sugerencias.length > 0 && (
            <div className="mt-2 rounded-xl border bg-white overflow-hidden divide-y">
              {sugerencias.map((s) => (
                <button
                  key={`${s.lat}-${s.lng}-${s.texto}`}
                  type="button"
                  onClick={() => elegirDireccion(s)}
                  className="w-full text-left px-3 py-2.5 hover:bg-[#e8f4ee] transition-colors"
                >
                  <span className="block text-[13px] font-medium text-negro">{s.texto}</span>
                  {s.direccion && <span className="block text-[11px] text-gris">{s.direccion}</span>}
                </button>
              ))}
            </div>
          )}

          {coordenadas && (
            <div className="mt-2 rounded-2xl border overflow-hidden bg-white">
              <iframe
                title="Mapa de la ubicación"
                width="100%"
                height="200"
                style={{ border: 0 }}
                referrerPolicy="no-referrer-when-downgrade"
                loading="lazy"
                src={`https://maps.google.com/maps?q=${coordenadas.lat},${coordenadas.lng}&z=16&output=embed`}
              />
              <div className="px-3 py-2 flex items-center justify-between gap-2">
                <span className="text-[11px] text-gris flex-1">📍 {direccion || zona}</span>
                {urlGoogleMaps && (
                  <a
                    href={urlGoogleMaps}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[12px] font-semibold text-verde whitespace-nowrap"
                  >
                    Abrir en Google Maps ↗
                  </a>
                )}
              </div>
            </div>
          )}

          <Button type="button" variant="outline" fullWidth size="sm" onClick={usarMiUbicacion} loading={buscandoUbicacion}>
            📍 Usar mi ubicación actual
          </Button>

          <div className="mt-2">
            <Button type="button" variant="outline" fullWidth size="sm" onClick={abrirSelectorMapa}>
              🗺️ Elegir la zona en Google Maps
            </Button>
            <div className="text-[11px] text-gris mt-1.5">
              {GOOGLE_MAPS_KEY
                ? 'Se abre el mapa para arrastrar el marcador 🚩 hasta tu negocio.'
                : 'Se abre el mapa en otra pestaña para que elijas y veas la zona; luego confirma la dirección en el campo de arriba.'}
            </div>
          </div>
        </div>

        {/* Aviso del rango fijo del plan de prueba */}
        <div
          style={{
            backgroundColor: '#FFF7E6',
            border: '1px solid #F59E0B',
            borderRadius: 12,
            padding: '10px 12px',
            fontSize: 12,
            color: '#92400E',
            lineHeight: 1.5,
          }}
        >
          <b>Rango fijo de 200 m:</b> el análisis se calcula en un radio de{' '}
          <b>200 metros</b> alrededor de la dirección que elijas (plan Prueba).
        </div>

        <div>
          <div className="text-xs font-medium text-gris mb-1.5">
            🏪 Tipo de negocio {sector && <span className="text-verde font-semibold">· {nombreSectorElegido}</span>}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {SECTORES.map((s) => (
              <SectorCard key={s.id} emoji={s.emoji} nombre={s.nombre} active={sector === s.id} onClick={() => setSector(s.id)} />
            ))}
            <SectorCard
              emoji="➕"
              nombre="Otro"
              active={sector === SECTOR_PERSONALIZADO}
              onClick={() => setSector(SECTOR_PERSONALIZADO)}
            />
          </div>
          {sector === SECTOR_PERSONALIZADO && (
            <Input
              label="✍️ ¿Cuál es el nicho?"
              placeholder="Ej. barbería canina, taller de costura, floristería"
              value={nichoPersonalizado}
              onChange={(e) => setNichoPersonalizado(e.target.value)}
            />
          )}
        </div>

        <div>
          <div className="text-xs font-medium text-gris mb-1.5">📏 Radio de análisis</div>
          <div className="flex gap-1.5 flex-wrap">
            {RADIOS.map((r) => (
              <Chip key={r.metros} active={radioMetros === r.metros}>
                {r.etiqueta}
              </Chip>
            ))}
          </div>
          <div className="text-[11px] text-gris mt-1.5">
            Rango fijo del plan de prueba (200 m). No se puede modificar por ahora.
          </div>
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        <Button type="submit" loading={cargando}>
          🔍 Generar análisis
        </Button>
      </form>

      {selectorAbierto && (
        <SelectorMapa
          apiKey={GOOGLE_MAPS_KEY}
          inicial={coordenadas}
          onConfirmar={elegirDesdeMapa}
          onCancelar={() => setSelectorAbierto(false)}
        />
      )}
    </>
  );
}
