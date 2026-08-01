'use client';

import { Loader2 } from 'lucide-react';

const VARIANTES = {
  primary: 'bg-verde-suave text-white hover:opacity-90',
  dark: 'bg-verde text-white hover:opacity-90',
  amber: 'bg-ambar text-ambar-texto hover:opacity-90',
  outline: 'bg-transparent text-verde border-[1.5px] border-verde hover:bg-verde-claro',
  ghost: 'bg-transparent text-gris hover:bg-white',
};

export default function Button({
  children,
  variant = 'primary',
  className = '',
  loading = false,
  disabled = false,
  fullWidth = true,
  size = 'md',
  type = 'button',
  ...props
}) {
  const tamano = size === 'sm' ? 'px-3 py-2 text-[13px] rounded-xl' : 'px-4 py-3.5 text-[15px] rounded-2xl';
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${fullWidth ? 'w-full' : ''} flex items-center justify-center gap-2 ${tamano} font-semibold font-sans transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${VARIANTES[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
