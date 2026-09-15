/**
 * ¿Cuándo se puede mostrar un dato de ejemplo en lugar del dato real?
 *
 * Esta función se eliminó del proyecto: la app ya NO tiene modo demo ni datos
 * de ejemplo. Todo lo que muestra viene del backend real (Supabase + lógica de
 * cada ruta), y los errores se muestran tal cual.
 *
 * Se deja la firma para no romper llamadas de código que aún la referencia,
 * pero SIEMPRE devuelve false: un error jamás se tapa con un dato inventado.
 *
 * @param status  código HTTP del error (0 = no hubo respuesta)
 * @param supabaseConfigurado  ¿la app tiene claves reales de Supabase?
 */
export function permiteDatosDeEjemplo(_status, _supabaseConfigurado) {
  return false;
}
