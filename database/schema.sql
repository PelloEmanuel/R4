-- Modelo relacional en 3FN. Ejecutar una vez: psql $DATABASE_URL -f database/schema.sql
DROP TABLE IF EXISTS project_skill, contact_message, project, achievement, experience, skill, skill_category, profile CASCADE;

CREATE TABLE profile (
  id          SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),   -- una sola persona
  full_name   VARCHAR(120) NOT NULL,
  headline    VARCHAR(160) NOT NULL,
  bio         TEXT NOT NULL,
  email       VARCHAR(160) NOT NULL,
  location    VARCHAR(120),
  github_url  VARCHAR(255),
  linkedin_url VARCHAR(255)
);

CREATE TABLE skill_category (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE skill (
  id          SERIAL PRIMARY KEY,
  category_id INT NOT NULL REFERENCES skill_category(id) ON DELETE RESTRICT,
  name        VARCHAR(60) NOT NULL UNIQUE,
  level       SMALLINT NOT NULL CHECK (level BETWEEN 1 AND 5)
);

CREATE TABLE experience (
  id           SERIAL PRIMARY KEY,
  kind         VARCHAR(10) NOT NULL CHECK (kind IN ('laboral', 'educacion')),
  role         VARCHAR(120) NOT NULL,
  organization VARCHAR(120) NOT NULL,
  start_date   DATE NOT NULL,
  end_date     DATE CHECK (end_date IS NULL OR end_date >= start_date),
  description  TEXT
);

CREATE TABLE achievement (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(140) NOT NULL,
  description TEXT,
  achieved_on DATE NOT NULL
);

CREATE TABLE project (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  repo_url    VARCHAR(255),
  demo_url    VARCHAR(255),
  created_on  DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Relación N:M proyecto <-> habilidad (evita listas repetidas: 1FN/2FN)
CREATE TABLE project_skill (
  project_id INT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  skill_id   INT NOT NULL REFERENCES skill(id)   ON DELETE CASCADE,
  PRIMARY KEY (project_id, skill_id)
);

CREATE TABLE contact_message (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(160) NOT NULL,
  message    TEXT NOT NULL CHECK (char_length(message) BETWEEN 10 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_skill_category ON skill(category_id);
CREATE INDEX idx_project_skill_skill ON project_skill(skill_id);
