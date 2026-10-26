# R4 — Portfolio full stack (React + Express + PostgreSQL)

Portfolio de una sola página. Los datos (perfil, habilidades, trayectoria, logros y proyectos) se leen desde una base de datos relacional y se pueden editar desde un panel de administración incluido en el mismo sitio.

## Stack
- **Frontend:** React 18 + Vite, CSS propio (tema claro/oscuro, responsive).
- **Backend:** Node.js + Express (`helmet`, validación de datos, consultas parametrizadas).
- **BBDD:** PostgreSQL, modelo en 3FN (`database/schema.sql`).

## Estructura
```
database/   schema.sql (tablas) y seed.sql (datos de ejemplo)
server/
  index.js   API pública: GET /api/r4
  admin.js   API de administración (crear/editar/eliminar), protegida por contraseña
client/src/
  components/  Navbar, Hero, About, Skills, Experience, Achievements, Projects, Section
  admin/       Panel de administración (login, listas, formularios, confirmación)
  hooks/       useTheme, useFetch, useInView, useActiveSection
```

## Panel de administración

El sitio tiene una segunda pantalla, en `/admin`, para agregar, editar y eliminar contenido sin tocar la base de datos a mano.

- **Acceso:** `https://tu-sitio/admin`, protegido por una única contraseña (no hay usuarios ni roles).
- **La contraseña se define en el servidor**, con la variable de entorno `ADMIN_PASSWORD` (ver `server/.env.example`). Nunca se guarda en el código ni en la base de datos.
- Cada sección (Perfil, Habilidades, Trayectoria, Logros, Proyectos) tiene su propio formulario para crear y editar, y un botón **Eliminar** por cada ítem.
- **Eliminar siempre pide confirmación** con un diálogo propio construido en React (`client/src/admin/ConfirmDialog.jsx`), no con el `window.confirm()` del navegador.
- No usa ninguna librería de rutas: `client/src/main.jsx` decide con `window.location.pathname` si mostrar el portfolio público o el panel.
- El botón para entrar no aparece en la página pública a propósito, para no invitar a cualquier visitante a probarlo; se accede escribiendo `/admin` en la barra de direcciones.

## Requisitos cubiertos
- **Hooks:** useState, useEffect, useRef, useMemo, useCallback + 4 hooks propios.
- **Eventos:** toggle de tema, menú móvil, pestañas, filtros de proyectos, formularios del panel de administración, scroll (IntersectionObserver).
- **Animaciones:** entrada del nombre, barras de habilidades al hacerse visibles, transiciones y hover; respeta `prefers-reduced-motion`.
- **Seguridad BBDD:** queries con parámetros, CHECK/FK/UNIQUE, panel de administración con contraseña, credenciales en variables de entorno.

## Modelo de datos (3FN)
`profile` · `skill_category` 1—N `skill` · `project` N—M `skill` (tabla `project_skill`) · `experience` · `achievement`.

## Desarrollo local
```bash
createdb r4
cp server/.env.example server/.env        # completar DATABASE_URL y ADMIN_PASSWORD
export DATABASE_URL=postgres://usuario:clave@localhost:5432/r4
npm run db:init
cd server && npm install && node --env-file=.env index.js   # terminal 1
cd client && npm install && npm run dev                      # terminal 2 (http://localhost:5173)
```
El panel de administración queda en http://localhost:5173/admin (en desarrollo) o en `/admin` sobre el mismo puerto del servidor en producción.

## Despliegue en Render (gratis, incluye PostgreSQL)
1. Subí el repo a GitHub.
2. Render → **New → PostgreSQL**. Copiá la *Internal Database URL* (para el servicio) y la *External Database URL* (para inicializar la base desde tu PC).
3. Inicializá las tablas desde tu computadora:
   ```bash
   cd server && npm install
   DATABASE_URL="<External Database URL>" DB_SSL=true node init-db.js
   ```
4. Render → **New → Web Service** con el repo:
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Variables: `DATABASE_URL` (*Internal Database URL*), `DB_SSL=true` y `ADMIN_PASSWORD` (elegí una propia)
5. Cuando termine, `https://tu-app.onrender.com` es el sitio público y `https://tu-app.onrender.com/admin` el panel de administración.

## Personalización
Entrá a `/admin`, iniciá sesión con tu `ADMIN_PASSWORD` y cargá tus datos reales desde ahí. `database/seed.sql` solo se usa la primera vez, para no arrancar con la base vacía.
