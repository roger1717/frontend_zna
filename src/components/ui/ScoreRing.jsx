/* frontend/src/components/ui/ScoreRing.jsx */
'use client';

const RADIO = 26;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;

function colorDelScore(score) {
  if (score >= 70) return '#1D4E3A'; // verde
  if (score >= 45) return '#E8923A'; // ambar
  return '#E24B4A'; // rojo
}

export default function ScoreRing({ score = 0, size = 64 }) {
  const valor = Math.min(100, Math.max(0, score));
  const offset = CIRCUNFERENCIA - (valor / 100) * CIRCUNFERENCIA;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="32" cy="32" r={RADIO} stroke="#E2DDD5" strokeWidth="5" fill="none" />
        <circle
          cx="32"
          cy="32"
          r={RADIO}
          stroke={colorDelScore(valor)}
          strokeWidth="5"
          fill="none"
          strokeDasharray={CIRCUNFERENCIA}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-display font-bold text-verde text-xl">
        {score ?? '—'}
      </div>
    </div>
  );
}
