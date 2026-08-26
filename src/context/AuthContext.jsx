// archivo src/context/AuthContext.jsx

'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase, supabaseConfigurado } from '@/lib/supabaseClient';
import { EVENTO_SESION_VENCIDA } from '@/lib/api';

const AuthContext = createContext(null);

const CLAVE_DEMO = 'zonapp_demo_sesion';

// Tope para recuperar la sesión al arrancar. Si Supabase no responde en este
// tiempo, la app entra como anónimo en vez de quedarse cargando.
const TIEMPO_LIMITE_MS = 8000;

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
    if (!supabaseConfigurado) {
      const sesion = leerSesionDemo();
      if (sesion) {
        setUser(sesion.user);
        setToken(sesion.token);
      }
      setLoading(false);
      return;
    }

    let vigente = true;

    // `loading` DEBE terminar siempre: si se queda en true, el layout muestra
    // el spinner para siempre y ni siquiera redirige al login. Por eso hay
    // límite de tiempo y captura de errores.
    Promise.race([
      supabase.auth.getSession(),
      new Promise((_, rechazar) =>
        setTimeout(() => rechazar(new Error('Supabase no respondió a tiempo.')), TIEMPO_LIMITE_MS),
      ),
    ])
      .then(({ data, error }) => {
        if (error) throw error;
        if (!vigente) return;
        setUser(data.session?.user ?? null);
        setToken(data.session?.access_token ?? null);
      })
      .catch(async (err) => {
        // Caso típico: se corrió `supabase db reset` y el token guardado en el
        // navegador ya no existe en la base. Se limpia la sesión rota y se
        // sigue como anónimo (el layout redirige al login).
        console.warn('[auth] sesión no recuperable, se limpia:', err?.message);
        await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
        if (!vigente) return;
        setUser(null);
        setToken(null);
      })
      .finally(() => {
        if (vigente) setLoading(false);
      });

    const { data: suscripcion } = supabase.auth.onAuthStateChange((_evento, session) => {
      setUser(session?.user ?? null);
      setToken(session?.access_token ?? null);
      setLoading(false);
    });

    return () => {
      vigente = false;
      suscripcion.subscription.unsubscribe();
    };
  }, []);

  // Si el backend responde 401 con Supabase configurado, el token ya no sirve
  // (venció, o la base se reinició). Se limpia la sesión y el layout de (app)
  // manda al login. Antes esto se trataba como "no hay backend" y la app mostraba
  // datos de ejemplo — el usuario creía estar viendo su inventario.
  useEffect(() => {
    async function alVencer() {
      if (supabaseConfigurado) {
        await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
      }
      setUser(null);
      setToken(null);
      setLoading(false);
    }

    window.addEventListener(EVENTO_SESION_VENCIDA, alVencer);
    return () => window.removeEventListener(EVENTO_SESION_VENCIDA, alVencer);
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
      // Si la confirmación de correo está activada (producción), signUp NO
      // devuelve sesión: el usuario debe confirmar su correo antes de entrar.
      // No lo marcamos como logueado con token null, porque entonces las
      // llamadas al backend fallarían con 401 y parecería un bug.
      if (!data.session) return { necesitaConfirmacion: true };
      setUser(data.user);
      setToken(data.session.access_token);
      return { necesitaConfirmacion: false };
    }

    if (!email || !password) throw new Error('Ingresa correo y contraseña.');
    const demoUser = { id: `demo-${email}`, email, nombre: nombre || email.split('@')[0] };
    const sesion = { user: demoUser, token: 'demo-token' };
    localStorage.setItem(CLAVE_DEMO, JSON.stringify(sesion));
    setUser(demoUser);
    setToken(sesion.token);
    return { necesitaConfirmacion: false };
  }, []);

  // Paso 1 de "olvidé mi contraseña": Supabase envía un correo con un enlace que
  // trae de vuelta al usuario a /actualizar-contrasena con una sesión temporal.
  const recuperarContrasena = useCallback(async (email) => {
    const limpio = (email || '').trim();
    if (!limpio) throw new Error('Ingresa tu correo electrónico.');
    if (!supabaseConfigurado) return; // demo: no hay un correo real que enviar.
    const redirectTo =
      typeof window !== 'undefined' ? `${window.location.origin}/actualizar-contrasena` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(limpio, { redirectTo });
    if (error) throw new Error(error.message);
  }, []);

  // Paso 2: ya con la sesión de recuperación activa, se fija la nueva contraseña.
  const actualizarContrasena = useCallback(async (password) => {
    if (!password || password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres.');
    }
    if (!supabaseConfigurado) return; // demo
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);
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
      value={{
        user,
        token,
        loading,
        modoDemo: !supabaseConfigurado,
        login,
        registro,
        logout,
        recuperarContrasena,
        actualizarContrasena,
      }}
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
