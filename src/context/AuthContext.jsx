'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase, supabaseConfigurado } from '@/lib/supabaseClient';

const AuthContext = createContext(null);

const CLAVE_DEMO = 'zonapp_demo_sesion';

function leerSesionDemo() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem(CLAVE_DEMO) || 'null');
  } catch {
    return null;
  }
}

// Sin claves reales de Supabase, la app entera funciona en "modo demo":
// cualquier correo/contraseña "inicia sesión" localmente, guardado en
// localStorage, para que se puedan ver y probar las 8 pantallas sin
// depender de un proyecto de Supabase real. La integración real
// (supabase-js) queda lista — apenas pongas las claves en .env.local,
// esto pasa a usarlas automáticamente, sin tocar código.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (supabaseConfigurado) {
      supabase.auth.getSession().then(({ data }) => {
        setUser(data.session?.user ?? null);
        setToken(data.session?.access_token ?? null);
        setLoading(false);
      });
      const { data: suscripcion } = supabase.auth.onAuthStateChange((_evento, session) => {
        setUser(session?.user ?? null);
        setToken(session?.access_token ?? null);
      });
      return () => suscripcion.subscription.unsubscribe();
    }

    const sesion = leerSesionDemo();
    if (sesion) {
      setUser(sesion.user);
      setToken(sesion.token);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    if (supabaseConfigurado) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      setUser(data.user);
      setToken(data.session?.access_token ?? null);
      return;
    }

    if (!email || !password) throw new Error('Ingresa correo y contraseña.');
    const demoUser = { id: `demo-${email}`, email, nombre: email.split('@')[0] };
    const sesion = { user: demoUser, token: 'demo-token' };
    localStorage.setItem(CLAVE_DEMO, JSON.stringify(sesion));
    setUser(demoUser);
    setToken(sesion.token);
  }, []);

  const registro = useCallback(async (email, password, nombre) => {
    if (supabaseConfigurado) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nombre } },
      });
      if (error) throw new Error(error.message);
      setUser(data.user);
      setToken(data.session?.access_token ?? null);
      return;
    }

    if (!email || !password) throw new Error('Ingresa correo y contraseña.');
    const demoUser = { id: `demo-${email}`, email, nombre: nombre || email.split('@')[0] };
    const sesion = { user: demoUser, token: 'demo-token' };
    localStorage.setItem(CLAVE_DEMO, JSON.stringify(sesion));
    setUser(demoUser);
    setToken(sesion.token);
  }, []);

  const logout = useCallback(async () => {
    if (supabaseConfigurado) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem(CLAVE_DEMO);
    }
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, modoDemo: !supabaseConfigurado, login, registro, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
