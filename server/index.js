import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './db.js';

const app = express();
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '../client/dist');

app.set('trust proxy', 1);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ['https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
      },
    },
  })
);
app.use(express.json({ limit: '10kb' }));

// --- Lectura del portfolio -------------------------------------------------
app.get('/api/portfolio', async (_req, res) => {
  try {
    const [profile, skills, experience, achievements, projects] = await Promise.all([
      pool.query('SELECT * FROM profile LIMIT 1'),
      pool.query(`SELECT s.id, s.name, s.level, c.name AS category
                  FROM skill s JOIN skill_category c ON c.id = s.category_id
                  ORDER BY c.name, s.level DESC`),
      pool.query('SELECT * FROM experience ORDER BY start_date DESC'),
      pool.query('SELECT * FROM achievement ORDER BY achieved_on DESC'),
      pool.query(`SELECT p.*, COALESCE(json_agg(s.name) FILTER (WHERE s.id IS NOT NULL), '[]') AS skills
                  FROM project p
                  LEFT JOIN project_skill ps ON ps.project_id = p.id
                  LEFT JOIN skill s ON s.id = ps.skill_id
                  GROUP BY p.id ORDER BY p.created_on DESC`),
    ]);
    res.json({
      profile: profile.rows[0] ?? null,
      skills: skills.rows,
      experience: experience.rows,
      achievements: achievements.rows,
      projects: projects.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No pudimos cargar el portfolio.' });
  }
});

// --- Formulario de contacto (validado y con límite de envíos) ---------------
const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5 });
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name = '', email = '', message = '' } = req.body ?? {};
  const errors = {};
  if (typeof name !== 'string' || name.trim().length < 2 || name.length > 100) errors.name = 'Ingresá tu nombre (2 a 100 caracteres).';
  if (typeof email !== 'string' || !EMAIL_RE.test(email) || email.length > 160) errors.email = 'Ingresá un email válido.';
  if (typeof message !== 'string' || message.trim().length < 10 || message.length > 2000) errors.message = 'El mensaje debe tener entre 10 y 2000 caracteres.';
  if (Object.keys(errors).length) return res.status(400).json({ errors });

  try {
    await pool.query('INSERT INTO contact_message (name, email, message) VALUES ($1, $2, $3)', [
      name.trim(), email.trim(), message.trim(),
    ]);
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No pudimos enviar tu mensaje. Probá de nuevo.' });
  }
});

// --- Frontend compilado ------------------------------------------------------
app.use(express.static(dist));
app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));

app.listen(process.env.PORT || 3000, () => console.log('Servidor activo'));
