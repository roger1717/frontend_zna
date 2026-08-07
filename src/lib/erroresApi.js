/**
 * ¿Cuándo se puede mostrar un dato de ejemplo en lugar del dato real?
 *
 * Está aquí, aparte y sin dependencias, por dos razones: es la regla de
 * honestidad de datos convertida en código (la parte del frontend que más caro
 * sale equivocar), y así se puede probar sola, sin navegador ni sesión.
 *
 * @param status  código HTTP del error (0 = no hubo respuesta)
 * @param supabaseConfigurado  ¿la app tiene claves reales de Supabase?
 */
export function permiteDatosDeEjemplo(status, supabaseConfigurado) {
  // No hubo forma de hablar con el servidor, o el servidor dice que no tiene
  // base de datos. En ambos casos no existe un dato real que mostrar.
  if (status === 0 || status === 503) return true;

  // Un 401 significa dos cosas distintas según el contexto, y confundirlas es
  // justo el error que esta función existe para evitar:
  //
  //   Sin claves de Supabase → la app corre en modo de ejemplo, el "token" es de
  //     mentira y el backend responde 401 siempre. Es el modo demo funcionando.
  //
  //   Con claves de Supabase → la sesión se venció o la borraron. Mostrar datos
  //     de ejemplo aquí sería gravísimo: el tendero vería un inventario que no es
  //     el suyo creyendo que sí, y podría registrar ventas contra él. Hay que
  //     mandarlo a iniciar sesión.
  if (status === 401) return !supabaseConfigurado;

  // 400, 403, 404, 409… son respuestas con información que el usuario necesita
  // leer. Taparlas con un ejemplo sería esconderle el problema.
  return false;
}
