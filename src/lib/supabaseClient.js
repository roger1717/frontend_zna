// /Users/rh/Documents/proyectos/zonapp/frontend/src/lib/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// La app NO tiene modo demo: sin claves reales de Supabase simplemente no hay
// autenticación posible (el login muestra el error y no deja entrar a nadie).
// Este archivo es el único lugar que decide si hay Supabase real disponible.
export const supabaseConfigurado = Boolean(url && anonKey);

export const supabase = supabaseConfigurado
  ? createClient(url, anonKey)
  : null;
