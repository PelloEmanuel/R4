import { Router } from 'express';
import crypto from 'node:crypto';
import { pool } from './db.js';

const router = Router();

// --- Autenticación simple por contraseña compartida -------------------
// No hay usuarios ni roles: una sola clave (ADMIN_PASSWORD) protege todo
// lo que modifica datos. El cliente la manda en el header x-admin-password
// en cada pedido de escritura; nunca se guarda en la base ni se loguea.
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function requireAdmin(req, res, next) {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) {
    return res.status(500).json({ error: 'Falta configurar ADMIN_PASSWORD en el servidor.' });
  }
  const given = req.get('x-admin-password');
  if (!given || !safeEqual(given, configured)) {
    return res.status(401).json({ error: 'Contraseña incorrecta.' });
  }
  next();
}

router.post('/login', (req, res) => {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) {
    return res.status(500).json({ error: 'Falta configurar ADMIN_PASSWORD en el servidor.' });
  }
  const { password } = req.body ?? {};
  if (!password || !safeEqual(password, configured)) {
    return res.status(401).json({ error: 'Contraseña incorrecta.' });
  }
  res.json({ ok: true });
});

// A partir de acá, todo requiere la contraseña.
router.use(requireAdmin);

// Helper para no repetir el try/catch en cada ruta.
const h = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') return res.status(409).json({ error: 'Ya existe un registro con ese valor único.' });
    if (err.code === '23503') return res.status(409).json({ error: 'No se puede completar: hay datos relacionados.' });
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

function required(body, fields) {
  const missing = fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === '');
  return missing;
}

// --- Perfil -------------------------------------------------------------
router.get('/profile', h(async (_req, res) => {
  const r = await pool.query('SELECT * FROM profile LIMIT 1');
  res.json(r.rows[0] ?? null);
}));

router.put('/profile', h(async (req, res) => {
  const { full_name, headline, bio, location, github_url } = req.body ?? {};
  const missing = required(req.body ?? {}, ['full_name', 'headline', 'bio']);
  if (missing.length) return res.status(400).json({ error: `Faltan campos: ${missing.join(', ')}` });
  const r = await pool.query(
    `INSERT INTO profile (id, full_name, headline, bio, location, github_url)
     VALUES (1, $1, $2, $3, $4, $5)
     ON CONFLICT (id) DO UPDATE SET full_name = $1, headline = $2, bio = $3, location = $4, github_url = $5
     RETURNING *`,
    [full_name, headline, bio, location || null, github_url || null]
  );
  res.json(r.rows[0]);
}));

// --- Categorías de habilidad ---------------------------------------------
router.get('/skill-categories', h(async (_req, res) => {
  const r = await pool.query('SELECT * FROM skill_category ORDER BY name');
  res.json(r.rows);
}));

router.post('/skill-categories', h(async (req, res) => {
  const { name } = req.body ?? {};
  if (!name) return res.status(400).json({ error: 'Falta el nombre de la categoría.' });
  const r = await pool.query(
    `INSERT INTO skill_category (name) VALUES ($1)
     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
     RETURNING *`,
    [name.trim()]
  );
  res.status(201).json(r.rows[0]);
}));

// --- Habilidades ----------------------------------------------------------
router.get('/skills', h(async (_req, res) => {
  const r = await pool.query(
    `SELECT s.id, s.name, s.description, s.category_id, c.name AS category
     FROM skill s JOIN skill_category c ON c.id = s.category_id
     ORDER BY c.name, s.name`
  );
  res.json(r.rows);
}));

router.post('/skills', h(async (req, res) => {
  const { name, description, category_id } = req.body ?? {};
  const missing = required(req.body ?? {}, ['name', 'description', 'category_id']);
  if (missing.length) return res.status(400).json({ error: `Faltan campos: ${missing.join(', ')}` });
  const r = await pool.query(
    'INSERT INTO skill (name, description, category_id) VALUES ($1, $2, $3) RETURNING *',
    [name.trim(), description.trim(), category_id]
  );
  res.status(201).json(r.rows[0]);
}));

router.put('/skills/:id', h(async (req, res) => {
  const { name, description, category_id } = req.body ?? {};
  const missing = required(req.body ?? {}, ['name', 'description', 'category_id']);
  if (missing.length) return res.status(400).json({ error: `Faltan campos: ${missing.join(', ')}` });
  const r = await pool.query(
    'UPDATE skill SET name = $1, description = $2, category_id = $3 WHERE id = $4 RETURNING *',
    [name.trim(), description.trim(), category_id, req.params.id]
  );
  if (!r.rows[0]) return res.status(404).json({ error: 'No existe esa habilidad.' });
  res.json(r.rows[0]);
}));

router.delete('/skills/:id', h(async (req, res) => {
  const r = await pool.query('DELETE FROM skill WHERE id = $1 RETURNING id', [req.params.id]);
  if (!r.rows[0]) return res.status(404).json({ error: 'No existe esa habilidad.' });
  res.json({ ok: true });
}));

// --- Trayectoria (experience) ---------------------------------------------
router.get('/experience', h(async (_req, res) => {
  const r = await pool.query('SELECT * FROM experience ORDER BY start_date DESC NULLS FIRST, id');
  res.json(r.rows);
}));

router.post('/experience', h(async (req, res) => {
  const { kind, role, organization, start_date, end_date, description } = req.body ?? {};
  const missing = required(req.body ?? {}, ['kind', 'role', 'organization']);
  if (missing.length) return res.status(400).json({ error: `Faltan campos: ${missing.join(', ')}` });
  if (!['laboral', 'educacion'].includes(kind)) return res.status(400).json({ error: 'kind debe ser laboral o educacion.' });
  const r = await pool.query(
    `INSERT INTO experience (kind, role, organization, start_date, end_date, description)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [kind, role.trim(), organization.trim(), start_date || null, end_date || null, description || null]
  );
  res.status(201).json(r.rows[0]);
}));

router.put('/experience/:id', h(async (req, res) => {
  const { kind, role, organization, start_date, end_date, description } = req.body ?? {};
  const missing = required(req.body ?? {}, ['kind', 'role', 'organization']);
  if (missing.length) return res.status(400).json({ error: `Faltan campos: ${missing.join(', ')}` });
  if (!['laboral', 'educacion'].includes(kind)) return res.status(400).json({ error: 'kind debe ser laboral o educacion.' });
  const r = await pool.query(
    `UPDATE experience SET kind = $1, role = $2, organization = $3, start_date = $4, end_date = $5, description = $6
     WHERE id = $7 RETURNING *`,
    [kind, role.trim(), organization.trim(), start_date || null, end_date || null, description || null, req.params.id]
  );
  if (!r.rows[0]) return res.status(404).json({ error: 'No existe ese registro.' });
  res.json(r.rows[0]);
}));

router.delete('/experience/:id', h(async (req, res) => {
  const r = await pool.query('DELETE FROM experience WHERE id = $1 RETURNING id', [req.params.id]);
  if (!r.rows[0]) return res.status(404).json({ error: 'No existe ese registro.' });
  res.json({ ok: true });
}));

// --- Logros (achievements) -------------------------------------------------
router.get('/achievements', h(async (_req, res) => {
  const r = await pool.query('SELECT * FROM achievement ORDER BY achieved_on DESC');
  res.json(r.rows);
}));

router.post('/achievements', h(async (req, res) => {
  const { title, description, achieved_on } = req.body ?? {};
  const missing = required(req.body ?? {}, ['title', 'achieved_on']);
  if (missing.length) return res.status(400).json({ error: `Faltan campos: ${missing.join(', ')}` });
  const r = await pool.query(
    'INSERT INTO achievement (title, description, achieved_on) VALUES ($1, $2, $3) RETURNING *',
    [title.trim(), description || null, achieved_on]
  );
  res.status(201).json(r.rows[0]);
}));

router.put('/achievements/:id', h(async (req, res) => {
  const { title, description, achieved_on } = req.body ?? {};
  const missing = required(req.body ?? {}, ['title', 'achieved_on']);
  if (missing.length) return res.status(400).json({ error: `Faltan campos: ${missing.join(', ')}` });
  const r = await pool.query(
    'UPDATE achievement SET title = $1, description = $2, achieved_on = $3 WHERE id = $4 RETURNING *',
    [title.trim(), description || null, achieved_on, req.params.id]
  );
  if (!r.rows[0]) return res.status(404).json({ error: 'No existe ese logro.' });
  res.json(r.rows[0]);
}));

router.delete('/achievements/:id', h(async (req, res) => {
  const r = await pool.query('DELETE FROM achievement WHERE id = $1 RETURNING id', [req.params.id]);
  if (!r.rows[0]) return res.status(404).json({ error: 'No existe ese logro.' });
  res.json({ ok: true });
}));

// --- Proyectos --------------------------------------------------------------
router.get('/projects', h(async (_req, res) => {
  const r = await pool.query(
    `SELECT p.*, COALESCE(json_agg(json_build_object('id', s.id, 'name', s.name)) FILTER (WHERE s.id IS NOT NULL), '[]') AS skills
     FROM project p
     LEFT JOIN project_skill ps ON ps.project_id = p.id
     LEFT JOIN skill s ON s.id = ps.skill_id
     GROUP BY p.id ORDER BY p.id`
  );
  res.json(r.rows);
}));

async function syncProjectSkills(client, projectId, skillIds) {
  await client.query('DELETE FROM project_skill WHERE project_id = $1', [projectId]);
  const ids = Array.isArray(skillIds) ? [...new Set(skillIds)] : [];
  for (const skillId of ids) {
    await client.query('INSERT INTO project_skill (project_id, skill_id) VALUES ($1, $2)', [projectId, skillId]);
  }
}

router.post('/projects', h(async (req, res) => {
  const { title, description, repo_url, demo_url, skill_ids } = req.body ?? {};
  const missing = required(req.body ?? {}, ['title', 'description']);
  if (missing.length) return res.status(400).json({ error: `Faltan campos: ${missing.join(', ')}` });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const r = await client.query(
      'INSERT INTO project (title, description, repo_url, demo_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [title.trim(), description.trim(), repo_url || null, demo_url || null]
    );
    await syncProjectSkills(client, r.rows[0].id, skill_ids);
    await client.query('COMMIT');
    res.status(201).json(r.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}));

router.put('/projects/:id', h(async (req, res) => {
  const { title, description, repo_url, demo_url, skill_ids } = req.body ?? {};
  const missing = required(req.body ?? {}, ['title', 'description']);
  if (missing.length) return res.status(400).json({ error: `Faltan campos: ${missing.join(', ')}` });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const r = await client.query(
      'UPDATE project SET title = $1, description = $2, repo_url = $3, demo_url = $4 WHERE id = $5 RETURNING *',
      [title.trim(), description.trim(), repo_url || null, demo_url || null, req.params.id]
    );
    if (!r.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'No existe ese proyecto.' });
    }
    await syncProjectSkills(client, req.params.id, skill_ids);
    await client.query('COMMIT');
    res.json(r.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}));

router.delete('/projects/:id', h(async (req, res) => {
  const r = await pool.query('DELETE FROM project WHERE id = $1 RETURNING id', [req.params.id]);
  if (!r.rows[0]) return res.status(404).json({ error: 'No existe ese proyecto.' });
  res.json({ ok: true });
}));

export default router;
