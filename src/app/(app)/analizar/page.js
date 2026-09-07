// frontend/src/app/(app)/analizar/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAnalysis } from '@/context/AnalysisContext';
import { analizarZona, ApiError } from '@/lib/api';
import { SECTORES, RADIOS } from '@/lib/constants';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import SectorCard from '@/components/ui/SectorCard';
import Alert from '@/components/ui/Alert';

export default function AnalizarPage() {
  const { token } = useAuth();
  const { setUltimoAnalisis, setContexto } = useAnalysis();
  const router = useRouter();

  const [zona, setZona] = useState('');
  const [sector, setSector] = useState('');
  const [radioMetros, setRadioMetros] = useState(500);
  const [coordenadas, setCoordenadas] = useState(null);
  const [coordManual, setCoordManual] = useState({ lat: '', lng: '' });
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  function usarMiUbicacion() {
    setError('');
    if (!navigator.geolocation) {
      setError('Tu navegador no permite obtener la ubicación automáticamente. Ingrésala manualmente abajo.');
      return;
    }
    setBuscandoUbicacion(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordenadas({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setBuscandoUbicacion(false);
      },
      () => {
        setError('No pudimos obtener tu ubicación. Ingrésala manualmente abajo.');
        setBuscandoUbicacion(false);
      }
    );
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');

    if (!zona.trim()) return setError('Ingresa una zona o ciudad.');
    if (!sector) return setError('Selecciona un tipo de negocio.');

    const coords = coordenadas || {
      lat: parseFloat(coordManual.lat),
      lng: parseFloat(coordManual.lng),
    };
    if (!Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) {
      return setError('Necesitamos la ubicación exacta — usa el botón de ubicación o ingresa las coordenadas.');
    }

    setCargando(true);
    try {
      const resultado = await analizarZona(
        { zona: zona.trim(), coordenadas: coords, sector, radio_metros: radioMetros },
        token
      );
      setUltimoAnalisis(resultado);
      setContexto({ zona: zona.trim(), sector, radioMetros });
      router.push('/analizar/resultado');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo generar el análisis.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      <div>
        <div className="font-display font-bold text-lg text-negro mb-1">Analiza tu zona</div>
        <div className="text-[13px] text-gris leading-relaxed">
          Selecciona sector, zona y radio para generar el análisis.
        </div>
      </div>

      <form onSubmit={manejarSubmit} className="flex flex-col gap-3">
        <Input
          label="📍 Ciudad o barrio"
          placeholder="Ej. Venecia, Sogamoso"
          value={zona}
          onChange={(e) => setZona(e.target.value)}
        />

        <div>
          <div className="text-xs font-medium text-gris mb-1.5">
            🏪 Tipo de negocio {sector && <span className="text-verde font-semibold">· {SECTORES.find((s) => s.id === sector)?.nombre}</span>}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {SECTORES.map((s) => (
              <SectorCard key={s.id} emoji={s.emoji} nombre={s.nombre} active={sector === s.id} onClick={() => setSector(s.id)} />
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-medium text-gris mb-1.5">📏 Radio de análisis</div>
          <div className="flex gap-1.5 flex-wrap">
            {RADIOS.map((r) => (
              <Chip key={r.metros} active={radioMetros === r.metros} onClick={() => setRadioMetros(r.metros)}>
                {r.etiqueta}
              </Chip>
            ))}
          </div>
          <div className="text-[11px] text-gris mt-1.5">Si estás en plan Gratis, el radio se ajusta automáticamente a 200 m.</div>
        </div>

        <div>
          <Button type="button" variant="outline" fullWidth size="sm" onClick={usarMiUbicacion} loading={buscandoUbicacion}>
            📍 Usar mi ubicación actual
          </Button>
          {coordenadas && (
            <div className="text-[11px] text-verde mt-1.5">
              Ubicación lista ({coordenadas.lat.toFixed(4)}, {coordenadas.lng.toFixed(4)})
            </div>
          )}
          {!coordenadas && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Input
                placeholder="Latitud"
                inputMode="decimal"
                value={coordManual.lat}
                onChange={(e) => setCoordManual({ ...coordManual, lat: e.target.value })}
              />
              <Input
                placeholder="Longitud"
                inputMode="decimal"
                value={coordManual.lng}
                onChange={(e) => setCoordManual({ ...coordManual, lng: e.target.value })}
              />
            </div>
          )}
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        <Button type="submit" loading={cargando}>
          🔍 Generar análisis
        </Button>
      </form>
    </>
  );
}
