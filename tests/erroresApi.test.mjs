// Prueba de la regla de "datos reales o error, nunca ejemplo" del frontend.
//
// Se corre con el runner que trae Node, sin instalar nada:
//   cd frontend && npm test
//
// Qué protege: que el modo demo YA NO EXISTE. Antes, sin conexión al servidor
// o sin claves de Supabase, la app mostraba "datos de ejemplo" fabricados, y el
// tendero podía creer que eran suyos. Ahora la regla es innegociable: cualquier
// error se muestra tal cual (nunca se tapa con un dato inventado).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { permiteDatosDeEjemplo } from '../src/lib/erroresApi.js';

const CON_SUPABASE = true;
const SIN_SUPABASE = false;

test('nunca se muestran datos de ejemplo, sin importar el error ni el modo', () => {
  for (const status of [0, 401, 503, 400, 403, 404, 409, 429, 500, 502]) {
    assert.equal(
      permiteDatosDeEjemplo(status, CON_SUPABASE),
      false,
      `un ${status} con Supabase no debería habilitar datos de ejemplo`
    );
    assert.equal(
      permiteDatosDeEjemplo(status, SIN_SUPABASE),
      false,
      `un ${status} sin Supabase no debería habilitar datos de ejemplo`
    );
  }
});
