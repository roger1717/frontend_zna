// frontend/src/app/layout.js

import { Syne, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { AnalysisProvider } from '@/context/AnalysisContext';

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin'],
  weight: ['700', '800'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export const metadata = {
  title: 'Zonapp — Análisis de mercado local',
  description: 'Analiza la competencia y oportunidades de tu zona antes de invertir.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${syne.variable} ${inter.variable}`}>
      <body className="min-h-screen text-negro antialiased"
      style={{ background: 'linear-gradient(160deg, var(--color-verde-oscuro) 0%, var(--color-verde) 55%, var(--color-verde-suave) 100%)' }}>
        <AuthProvider>
          <AnalysisProvider>{children}</AnalysisProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
