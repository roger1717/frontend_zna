export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-verde flex flex-col items-center justify-center p-6">
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-11 h-11 rounded-2xl bg-ambar flex items-center justify-center text-xl font-black text-ambar-texto font-display">
          Z
        </div>
        <span className="font-display font-extrabold text-3xl text-white tracking-tight">Zonapp</span>
      </div>
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl">{children}</div>
      <p className="text-white/50 text-xs mt-6 text-center max-w-xs">
        Análisis de mercado local con IA — conoce tu zona antes de invertir.
      </p>
    </div>
  );
}
