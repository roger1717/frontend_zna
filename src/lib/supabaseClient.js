// /Users/rh/Documents/proyectos/zonapp/frontend/src/lib/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Si todavía no tienes las claves reales de Supabase, la app entera pasa
// a "modo demo" (ver AuthContext) en vez de romperse. Este archivo es el
// único lugar que decide si estamos en modo real o demo.
export const supabaseConfigurado = Boolean(url && anonKey);

export const supabase = supabaseConfigurado
  ? createClient(url, anonKey)
  : null;
