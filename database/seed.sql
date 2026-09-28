INSERT INTO profile (full_name, headline, bio, location, github_url) VALUES
('Pello Emanuel',
 'Estudiante de informática',
 'Soy un estudiante de la Escuela de Educación Secundaria Técnica N° 5 en la orientación de informática.',
 NULL,
 'https://github.com/PelloEmanuel');

INSERT INTO skill_category (name) VALUES ('Frontend'), ('Backend'), ('Bases de datos'), ('Herramientas');

INSERT INTO skill (category_id, name, description) VALUES
(1, 'React',      'Armo páginas web con componentes, hooks y eventos.'),
(1, 'JavaScript', 'Uso variables, funciones, arrays y condicionales para darle vida a las páginas.'),
(1, 'HTML y CSS', 'Armo la estructura y el diseño de las páginas web.'),
(2, 'Node.js',    'Creo servidores simples y practico con ejercicios de backend.'),
(3, 'SQL',        'Guardo y consulto información en bases de datos como PostgreSQL.'),
(4, 'Git y GitHub', 'Guardo mis proyectos por versiones y los subo a GitHub.');

INSERT INTO experience (kind, role, organization, start_date, end_date, description) VALUES
('educacion',
 'Estudiante de la orientación Informática',
 'Escuela de Educación Secundaria Técnica N° 5',
 NULL, NULL,
 'Actualmente sigo cursando en la escuela.');

-- Logros: todavía no hay ninguno (la tabla queda vacía a propósito).

INSERT INTO project (title, description, repo_url) VALUES
('R2', 'Proyecto de práctica hecho con React.', 'https://github.com/PelloEmanuel/R2'),
('R3', 'Proyecto de práctica hecho con React.', 'https://github.com/PelloEmanuel/R3'),
('R4', 'Proyecto de práctica hecho con React.', 'https://github.com/PelloEmanuel/R4'),
('R5', 'Proyecto de práctica hecho con React.', 'https://github.com/PelloEmanuel/R5'),
('Ejercicios Node.js', 'Ejercicios de práctica con Node.js.', 'https://github.com/PelloEmanuel/Ejercicios-NodeJS'),
('NJS2', 'Proyecto de práctica hecho con Node.js.', 'https://github.com/PelloEmanuel/NJS2'),
('NJS3', 'Proyecto de práctica hecho con Node.js.', 'https://github.com/PelloEmanuel/NJS3'),
('JS0', 'Proyecto de práctica hecho con JavaScript.', 'https://github.com/PelloEmanuel/JS0'),
('JS1', 'Proyecto de práctica hecho con JavaScript.', 'https://github.com/PelloEmanuel/JS1'),
('JS2', 'Proyecto de práctica hecho con JavaScript.', 'https://github.com/PelloEmanuel/JS2'),
('JS3', 'Proyecto de práctica hecho con JavaScript.', 'https://github.com/PelloEmanuel/JS3'),
('O2', 'Proyecto de práctica.', 'https://github.com/PelloEmanuel/O2');

-- Tecnología de cada proyecto (O2 queda sin etiqueta porque no se indicó su tecnología).
INSERT INTO project_skill (project_id, skill_id)
SELECT p.id, s.id
FROM (VALUES
  ('R2','React'), ('R3','React'), ('R4','React'), ('R5','React'),
  ('Ejercicios Node.js','Node.js'), ('NJS2','Node.js'), ('NJS3','Node.js'),
  ('JS0','JavaScript'), ('JS1','JavaScript'), ('JS2','JavaScript'), ('JS3','JavaScript')
) AS m(project_title, skill_name)
JOIN project p ON p.title = m.project_title
JOIN skill s   ON s.name  = m.skill_name;
