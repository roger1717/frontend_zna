import { redirect } from 'next/navigation';

// `/seguimiento` ya no existe como pantalla: quedó reemplazada por `/ventas`
// (decisión D7 del plan de la Fase 3).
//
// Por qué se retiró: era una pantalla heredada del diseño del cliente que pedía
// escribir a mano "cuánto vendiste hoy" y llamaba a `/api/seguimiento`, endpoints
// que nuestro backend nunca implementó — así que siempre mostraba datos de
// ejemplo. Con `/ventas` ese número **se calcula** a partir de las ventas
// registradas, en vez de depender de la memoria del tendero. Tener las dos habría
// dejado dos respuestas distintas a "¿cuánto vendí hoy?".
//
// Se deja el redirect en lugar de borrar la carpeta para que un enlace viejo o un
// marcador del navegador lleven al sitio correcto en vez de a un 404.
export default function SeguimientoPage() {
  redirect('/ventas');
}
