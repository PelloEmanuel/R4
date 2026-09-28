const STORAGE_KEY = 'r4_admin_password';

export function getToken() {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch (e) {
    return '';
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token);
    else localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    /* localStorage puede fallar en navegación privada; el panel igual funciona en la sesión actual */
  }
}

// onUnauthorized se llama cuando el servidor rechaza la contraseña guardada
// (venció, se cambió en el servidor, etc.), para volver a pedirla.
let onUnauthorized = () => {};
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

export async function apiFetch(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': getToken(),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    /* respuestas sin cuerpo (204, etc.) */
  }

  if (res.status === 401) {
    setToken('');
    // No mandamos a la pantalla de login desde acá si ya estamos en ella
    // (path === '/api/admin/login'): ahí el mensaje del servidor alcanza.
    if (!path.endsWith('/login')) onUnauthorized();
    throw new Error((data && data.error) || 'Contraseña incorrecta.');
  }

  if (!res.ok) {
    throw new Error((data && data.error) || 'Ocurrió un error inesperado.');
  }
  return data;
}
