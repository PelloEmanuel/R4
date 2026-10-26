/**
 * Utilidades de fechas. Formato único de todo el proyecto (Latinoamérica): día/mes/año -> dd/mm/aaaa.
 * La base de datos y la API trabajan en ISO (AAAA-MM-DD); solo se MUESTRA como dd/mm/aaaa.
 * Regla: cualquier fecha que vea el usuario debe pasar por formatDate().
 */

// Convierte una fecha ISO ("2025-03-07" o "2025-03-07T00:00:00.000Z") en "07/03/2025".
// Devuelve '' si no hay fecha. Se arma con el texto, sin new Date(), para que la zona horaria no cambie el día.
export function formatDate(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || ''));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}
