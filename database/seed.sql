-- Datos de ejemplo: reemplazá con los tuyos.
INSERT INTO profile (full_name, headline, bio, email, location, github_url, linkedin_url) VALUES
('Pello Emanuel', 'Desarrollador/a web full stack', 'Estudio desarrollo de software y me gusta construir interfaces claras, accesibles y rápidas, con bases de datos bien modeladas.', 'pelloemanuel@gmail.com', 'Mar del Plata, Buenos Aires', 'https://github.com/PelloEmanuel', NULL);

INSERT INTO skill_category (name) VALUES ('Frontend'), ('Backend'), ('Bases de datos'), ('Herramientas');

INSERT INTO skill (category_id, name, level) VALUES
(1,'React',4),(1,'JavaScript',4),(1,'CSS',5),(2,'Node.js',3),(2,'Express',3),
(3,'PostgreSQL',4),(3,'SQL',4),(4,'Git',4),(4,'Figma',3);

INSERT INTO experience (kind, role, organization, start_date, end_date, description) VALUES
('educacion','Tecnicatura en Desarrollo de Software','Instituto (completar)','2024-03-01',NULL,'Programación, bases de datos y desarrollo web.'),
('laboral','Desarrollador freelance','Proyectos propios','2025-01-01',NULL,'Sitios web a medida para pequeños comercios.');

INSERT INTO achievement (title, description, achieved_on) VALUES
('Mejor proyecto integrador','Reconocimiento por el diseño y la arquitectura de la entrega final.','2025-12-10'),
('Certificación en JavaScript','Curso avanzado de JavaScript moderno.','2025-06-20');

INSERT INTO project (title, description, repo_url, demo_url, created_on) VALUES
('Gestor de turnos','App para reservar turnos con calendario y panel de administración.','https://github.com/tu-usuario/turnos','https://example.com','2026-03-15'),
('Tienda demo','Catálogo con carrito y checkout simulado.','https://github.com/tu-usuario/tienda','https://example.com','2025-11-02');

INSERT INTO project_skill VALUES (1,1),(1,4),(1,6),(2,1),(2,2),(2,3);
