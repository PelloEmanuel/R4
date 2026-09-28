# Portfolio full stack (React + Express + PostgreSQL)

Portfolio de una sola página. Los datos (perfil, habilidades, trayectoria, logros y proyectos) se leen desde una base de datos relacional y el formulario de contacto guarda los mensajes en ella.

## Stack
- **Frontend:** React 18 + Vite, CSS propio (tema claro/oscuro, responsive).
- **Backend:** Node.js + Express (`helmet`, rate limit, validación, consultas parametrizadas).
- **BBDD:** PostgreSQL, modelo en 3FN (`database/schema.sql`).

## Estructura
```
database/   schema.sql (tablas) y seed.sql (datos de ejemplo)
server/     API REST: GET /api/portfolio, POST /api/contact
client/src/
  components/  Navbar, Hero, About, Skills, Experience, Achievements, Projects, Contact, Section
  hooks/       useTheme, useFetch, useInView, useActiveSection
```

## Requisitos cubiertos
- **Hooks:** useState, useEffect, useRef, useMemo, useCallback + 4 hooks propios.
- **Eventos:** toggle de tema, menú móvil, pestañas, filtros de proyectos, envío del formulario, scroll (IntersectionObserver).
- **Animaciones:** entrada del nombre, barras de habilidades al hacerse visibles, transiciones y hover; respeta `prefers-reduced-motion`.
- **Seguridad BBDD:** queries con parámetros, CHECK/FK/UNIQUE, límite de envíos, credenciales en variables de entorno.

## Modelo de datos (3FN)
`profile` · `skill_category` 1—N `skill` · `project` N—M `skill` (tabla `project_skill`) · `experience` · `achievement` · `contact_message`.

## Desarrollo local
```bash
createdb portfolio
cp server/.env.example server/.env        # completar DATABASE_URL
export DATABASE_URL=postgres://usuario:clave@localhost:5432/portfolio
npm run db:init
cd server && npm install && node --env-file=.env index.js   # terminal 1
cd client && npm install && npm run dev                      # terminal 2 (http://localhost:5173)
```

## Despliegue en Render (gratis, incluye PostgreSQL)
1. Subí el repo a GitHub.
2. Render → **New → PostgreSQL**. Copiá la *External Database URL* y ejecutá `DATABASE_URL="<url>" npm run db:init` desde tu máquina.
3. Render → **New → Web Service** con el repo:
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Variables: `DATABASE_URL` (*Internal Database URL*) y `DB_SSL=true`
4. Cuando termine, el link `https://tu-app.onrender.com` es la entrega.

## Personalización
Editá `database/seed.sql` con tus datos reales (o insertalos directamente en la BBDD) y volvé a ejecutar `npm run db:init`.
