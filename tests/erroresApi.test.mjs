// Prueba de la regla de honestidad de datos del frontend (ajuste A1).
//
// Se corre con el runner que trae Node, sin instalar nada:
//   cd frontend && npm test
//
// Qué protege: que un 401 con Supabase configurado NUNCA habilite datos de
// ejemplo. Es un caso que en el navegador casi no se ve (supabase-js refresca el
// token solo) pero que en móvil es la norma, porque la app pasa horas suspendida.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { permiteDatosDeEjemplo } from '../src/lib/erroresApi.js';

const CON_SUPABASE = true;
const SIN_SUPABASE = false;

test('sin conexión con el servidor sí se muestran datos de ejemplo', () => {
  assert.equal(permiteDatosDeEjemplo(0, CON_SUPABASE), true);
  assert.equal(permiteDatosDeEjemplo(0, SIN_SUPABASE), true);
});

test('si el servidor no tiene base de datos (503) sí se muestran datos de ejemplo', () => {
  assert.equal(permiteDatosDeEjemplo(503, CON_SUPABASE), true);
  assert.equal(permiteDatosDeEjemplo(503, SIN_SUPABASE), true);
});

test('401 en modo de ejemplo (sin claves) sí muestra datos de ejemplo', () => {
  assert.equal(permiteDatosDeEjemplo(401, SIN_SUPABASE), true);
});

test('401 con Supabase configurado NO muestra datos de ejemplo: es sesión vencida', () => {
  assert.equal(permiteDatosDeEjemplo(401, CON_SUPABASE), false);
});

test('los errores que el usuario debe leer no se tapan con un ejemplo', () => {
  for (const status of [400, 403, 404, 409, 429, 500, 502]) {
    assert.equal(
      permiteDatosDeEjemplo(status, CON_SUPABASE),
      false,
      `un ${status} no debería habilitar datos de ejemplo`
    );
  }
});
