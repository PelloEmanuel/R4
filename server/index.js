import express from 'express';
import helmet from 'helmet';
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

// --- Lectura del r4 -------------------------------------------------
app.get('/api/r4', async (_req, res) => {
  try {
    const [profile, skills, experience, achievements, projects] = await Promise.all([
      pool.query('SELECT * FROM profile LIMIT 1'),
      pool.query(`SELECT s.id, s.name, s.description, c.name AS category
                  FROM skill s JOIN skill_category c ON c.id = s.category_id
                  ORDER BY s.id`),
      pool.query('SELECT * FROM experience ORDER BY start_date DESC NULLS FIRST, id'),
      pool.query('SELECT * FROM achievement ORDER BY achieved_on DESC'),
      pool.query(`SELECT p.*, COALESCE(json_agg(s.name) FILTER (WHERE s.id IS NOT NULL), '[]') AS skills
                  FROM project p
                  LEFT JOIN project_skill ps ON ps.project_id = p.id
                  LEFT JOIN skill s ON s.id = ps.skill_id
                  GROUP BY p.id ORDER BY p.id`),
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
    res.status(500).json({ error: 'No pudimos cargar el R4.' });
  }
});

// --- Frontend compilado ------------------------------------------------------
app.use(express.static(dist));
app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));

app.listen(process.env.PORT || 3000, () => console.log('Servidor activo'));
