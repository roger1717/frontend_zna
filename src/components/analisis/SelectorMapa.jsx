// frontend/src/components/analisis/SelectorMapa.jsx
//
// Modal para elegir la ubicación exacta del análisis sobre un mapa de Google.
// - Buscador con autocompletado de direcciones (Places, restringido a Colombia).
// - Marcador arrastrable: al soltarlo, se obtiene la dirección (geocoder inverso).
// - "Confirmar esta ubicación" devuelve { lat, lng, direccion } al formulario.
//
// Requiere una clave de navegador: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (o
// NEXT_PUBLIC_GEOCODING_API_KEY / NEXT_PUBLIC_PLACES_API_KEY) en frontend/.env.local.

'use client';

import { useEffect, useRef, useState } from 'react';

// Carga UNA sola vez el script de Google Maps y reutiliza la promesa.
let promesaGoogle = null;

// Un Google Maps "roto" (p. ej. cuando la API cargó sin estar activada) deja un
// objeto window.google.maps sin el constructor Map. Solo consideramos lista la
// librería si Map existe de verdad.
function googleMapsListo() {
  return (
    typeof window !== 'undefined' &&
    window.google?.maps?.Map &&
    typeof window.google.maps.Map === 'function'
  );
}

function quitarScriptsGoogleMap() {
  document
    .querySelectorAll('script[src*="maps.googleapis.com/maps/api/js"]')
    .forEach((el) => el.remove());
}

function cargarGoogleMaps(key) {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('No hay navegador.'));
  }
  // Ya está cargada y completa → reutilizar.
  if (googleMapsListo()) return Promise.resolve(window.google.maps);
  // Ya hay una carga en curso → devolver esa misma promesa.
  if (promesaGoogle) return promesaGoogle;

  promesaGoogle = new Promise((resolve, reject) => {
    // Descarta cualquier stub roto de un intento anterior (API no activada,
    // restricción fallida, etc.) y vuelve a cargar desde cero.
    quitarScriptsGoogleMap();
    delete window.google;

    const script = document.createElement('script');
    script.id = 'zonapp-gmaps';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&region=co&language=es&loading=async&v=weekly`;
    script.async = true;

    let termino = false;
    const timeoutGlobal = setTimeout(() => {
      if (termino) return;
      termino = true;
      promesaGoogle = null;
      reject(new Error('Google Maps tardó demasiado en cargar. Revisa tu conexión e intenta de nuevo.'));
    }, 15000);

    script.onload = () => {
      // Con loading=async el onload puede dispararse un instante antes de que
      // Maps exponga el constructor Map → verificar con un poll corto.
      const inicio = Date.now();
      const revisar = () => {
        if (googleMapsListo()) {
          if (!termino) {
            termino = true;
            clearTimeout(timeoutGlobal);
            resolve(window.google.maps);
          }
          return;
        }
        if (Date.now() - inicio > 5000) {
          if (!termino) {
            termino = true;
            clearTimeout(timeoutGlobal);
            promesaGoogle = null;
            reject(new Error('Google Maps no inicializó correctamente. Recarga la página e intenta de nuevo.'));
          }
          return;
        }
        setTimeout(revisar, 25);
      };
      revisar();
    };

    script.onerror = () => {
      if (!termino) {
        termino = true;
        clearTimeout(timeoutGlobal);
        promesaGoogle = null;
        reject(new Error('No se pudo cargar Google Maps. Verifica la clave y el dominio permitido.'));
      }
    };

    document.head.appendChild(script);
  });

  return promesaGoogle;
}

const CENTRO_POR_DEFECTO = { lat: 4.711, lng: -74.0721 }; // Bogotá, Colombia

export default function SelectorMapa({ apiKey, inicial, onConfirmar, onCancelar }) {
  const contenedorRef = useRef(null);
  const buscadorRef = useRef(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [pos, setPos] = useState(
    inicial && typeof inicial.lat === 'number' && typeof inicial.lng === 'number'
      ? { lat: inicial.lat, lng: inicial.lng }
      : CENTRO_POR_DEFECTO
  );
  const [direccion, setDireccion] = useState(inicial?.direccion || '');

  useEffect(() => {
    let dadoDeBaja = false;

    // Si la clave falla por API desactivada o dominio no permitido, Google
    // invoca gm_authFailure DESPUÉS de cargar el script → lo capturamos aquí
    // para mostrar el error real en lugar de dejar "Cargando…" infinito.
    const manejarAuthFailure = () => {
      if (dadoDeBaja) return;
      setError(
        'Google Maps no se pudo iniciar con esta clave. Verifica que la API "Maps JavaScript API" esté habilitada en Google Cloud Console y que el dominio esté permitido en las restricciones de la clave.'
      );
      setCargando(false);
    };
    window.gm_authFailure = manejarAuthFailure;

    cargarGoogleMaps(apiKey)
      .then((maps) => {
        if (dadoDeBaja) return;

        const mapa = new maps.Map(contenedorRef.current, {
          center: pos,
          zoom: 16,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        const geocoder = new maps.Geocoder();
        const marcador = new maps.Marker({
          position: pos,
          map: mapa,
          draggable: true,
          title: 'Tu negocio (arrastra para ajustar)',
        });

        const sincronizarDesdeMarcador = () => {
          const ll = {
            lat: marcador.getPosition().lat(),
            lng: marcador.getPosition().lng(),
          };
          setPos(ll);
          geocoder.geocode({ location: ll }, (results, status) => {
            if (!dadoDeBaja && status === 'OK' && results?.[0]) {
              setDireccion(results[0].formatted_address);
            }
          });
        };
        maps.event.addListener(marcador, 'dragend', sincronizarDesdeMarcador);

        if (buscadorRef.current) {
          const autocomplete = new maps.places.Autocomplete(buscadorRef.current, {
            types: ['address'],
            componentRestrictions: { country: 'co' },
          });
          autocomplete.addListener('place_changed', () => {
            const lugar = autocomplete.getPlace();
            if (lugar?.geometry?.location) {
              const ll = {
                lat: lugar.geometry.location.lat(),
                lng: lugar.geometry.location.lng(),
              };
              marcador.setPosition(ll);
              mapa.panTo(ll);
              setPos(ll);
              setDireccion(lugar.formatted_address || '');
            }
          });
        }

        setCargando(false);
      })
      .catch((err) => {
        if (!dadoDeBaja) {
          setError(err.message);
          setCargando(false);
        }
      });

    return () => {
      dadoDeBaja = true;
      if (window.gm_authFailure === manejarAuthFailure) {
        window.gm_authFailure = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  return (
    <div style={estilos.overlay}>
      <div style={estilos.panel}>
        <div style={estilos.header}>
          <div>
            <div style={estilos.titulo}>Elige la ubicación exacta</div>
            <div style={estilos.sub}>
              Busca la dirección o arrastra el marcador 🚩 hasta tu negocio.
            </div>
          </div>
          <button type="button" onClick={onCancelar} style={estilos.cerrar} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <input
          ref={buscadorRef}
          placeholder="Buscar calle, carrera o barrio…"
          style={estilos.buscador}
        />

        {error ? <div style={estilos.errorBox}>{error}</div> : null}

        <div style={estilos.mapaWrap}>
          {cargando && (
            <div style={estilos.cargandoBox}>
              {error ? 'Cargando…' : 'Cargando mapa…'}
            </div>
          )}
          <div ref={contenedorRef} style={{ width: '100%', height: '100%' }} />
        </div>

        <div style={estilos.resumen}>
          <div style={estilos.resumenDir}>
            📍 {direccion || (pos ? `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}` : 'Mueve el marcador')}
          </div>
          <div style={estilos.resumenCoord}>
            {pos ? `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}` : ''}
          </div>
        </div>

        <div style={estilos.pie}>
          <button type="button" onClick={onCancelar} style={estilos.btnSecundario}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirmar({ lat: pos.lat, lng: pos.lng, direccion })}
            disabled={cargando}
            style={estilos.btnPrimario}
          >
            ✓ Confirmar esta ubicación
          </button>
        </div>
      </div>
    </div>
  );
}

const estilos = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 999,
    backgroundColor: 'rgba(0,0,0,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  panel: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '16px 18px',
    backgroundColor: '#f4faf7',
    borderBottom: '1px solid #e2ece7',
  },
  titulo: { fontSize: 16, fontWeight: 700, color: '#13382b' },
  sub: { fontSize: 12, color: '#5f6f68', marginTop: 2 },
  cerrar: {
    border: 'none',
    background: 'transparent',
    fontSize: 18,
    color: '#5f6f68',
    cursor: 'pointer',
    padding: 4,
  },
  buscador: {
    margin: 14,
    padding: '12px 14px',
    borderRadius: 12,
    border: '1.5px solid #cbdcd3',
    fontSize: 14,
    outline: 'none',
  },
  errorBox: {
    margin: '0 14px 10px',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fdecec',
    border: '1px solid #f5b5b5',
    color: '#b3312c',
    fontSize: 12,
  },
  mapaWrap: { position: 'relative', height: 300, margin: '0 14px' },
  cargandoBox: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    color: '#5f6f68',
  },
  resumen: {
    margin: 14,
    padding: '10px 12px',
    borderRadius: 10,
    backgroundColor: '#f4faf7',
    border: '1px solid #e2ece7',
  },
  resumenDir: { fontSize: 13, color: '#13382b', fontWeight: 600 },
  resumenCoord: { fontSize: 11, color: '#5f6f68', marginTop: 2 },
  pie: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 14,
    borderTop: '1px solid #e2ece7',
  },
  btnSecundario: {
    padding: '10px 16px',
    borderRadius: 10,
    border: '1px solid #cbdcd3',
    backgroundColor: '#fff',
    color: '#5f6f68',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnPrimario: {
    padding: '10px 16px',
    borderRadius: 10,
    border: 'none',
    backgroundColor: '#1d4e3a',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  },
};