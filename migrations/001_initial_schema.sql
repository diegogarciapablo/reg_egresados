CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('graduate', 'admin');
CREATE TYPE profile_visibility AS ENUM ('public', 'link_only', 'private');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(254) NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'graduate',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_email_unique UNIQUE (email),
  CONSTRAINT users_email_lowercase CHECK (email = LOWER(email))
);

CREATE TABLE graduates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  registration_code VARCHAR(30) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(150) NOT NULL,
  "current_role" VARCHAR(150),
  graduation_year SMALLINT NOT NULL,
  professional_summary VARCHAR(1000),
  photo_url TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  visibility profile_visibility NOT NULL DEFAULT 'private',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT graduates_year_valid CHECK (graduation_year BETWEEN 1950 AND 2100)
);

CREATE TABLE technologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(80) NOT NULL UNIQUE,
  slug VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE graduate_technologies (
  graduate_id UUID NOT NULL REFERENCES graduates(id) ON DELETE CASCADE,
  technology_id UUID NOT NULL REFERENCES technologies(id) ON DELETE RESTRICT,
  proficiency SMALLINT,
  display_order SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (graduate_id, technology_id),
  CONSTRAINT proficiency_valid CHECK (proficiency IS NULL OR proficiency BETWEEN 1 AND 5)
);

CREATE TABLE soft_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE graduate_soft_skills (
  graduate_id UUID NOT NULL REFERENCES graduates(id) ON DELETE CASCADE,
  soft_skill_id UUID NOT NULL REFERENCES soft_skills(id) ON DELETE RESTRICT,
  display_order SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (graduate_id, soft_skill_id)
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  graduate_id UUID NOT NULL REFERENCES graduates(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  description VARCHAR(2000),
  url TEXT,
  repository_url TEXT,
  display_order SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  graduate_id UUID NOT NULL REFERENCES graduates(id) ON DELETE CASCADE,
  position VARCHAR(150) NOT NULL,
  organization VARCHAR(150) NOT NULL,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  description VARCHAR(2000),
  display_order SMALLINT NOT NULL DEFAULT 0,
  CONSTRAINT experience_dates_valid CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  graduate_id UUID NOT NULL REFERENCES graduates(id) ON DELETE CASCADE,
  author_name VARCHAR(150) NOT NULL,
  author_role VARCHAR(150),
  message VARCHAR(1500) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT recommendation_status_valid CHECK (status IN ('pending', 'published', 'rejected'))
);

CREATE TABLE cover_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  graduate_id UUID NOT NULL REFERENCES graduates(id) ON DELETE CASCADE,
  full_name VARCHAR(200) NOT NULL,
  city_country VARCHAR(150),
  phone VARCHAR(40),
  email VARCHAR(254),
  sending_city VARCHAR(100),
  sending_date DATE,
  recruiter_name VARCHAR(150),
  recruiter_role VARCHAR(150),
  company_name VARCHAR(150) NOT NULL,
  target_position VARCHAR(150) NOT NULL,
  job_source VARCHAR(150),
  career VARCHAR(150),
  university VARCHAR(150),
  specialty VARCHAR(100),
  relevant_experience VARCHAR(2000),
  motivation VARCHAR(2000),
  value_proposition VARCHAR(2000),
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT cover_letter_status_valid CHECK (status IN ('draft', 'archived'))
);

CREATE TABLE cover_letter_technologies (
  cover_letter_id UUID NOT NULL REFERENCES cover_letters(id) ON DELETE CASCADE,
  technology_id UUID NOT NULL REFERENCES technologies(id) ON DELETE RESTRICT,
  display_order SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (cover_letter_id, technology_id)
);

CREATE TABLE cover_letter_soft_skills (
  cover_letter_id UUID NOT NULL REFERENCES cover_letters(id) ON DELETE CASCADE,
  soft_skill_id UUID NOT NULL REFERENCES soft_skills(id) ON DELETE RESTRICT,
  display_order SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (cover_letter_id, soft_skill_id)
);

CREATE INDEX graduates_directory_idx
  ON graduates (visibility, graduation_year, last_name, first_name);
CREATE INDEX projects_graduate_order_idx
  ON projects (graduate_id, display_order);
CREATE INDEX experiences_graduate_order_idx
  ON experiences (graduate_id, display_order);
CREATE INDEX recommendations_graduate_status_idx
  ON recommendations (graduate_id, status, created_at DESC);
CREATE INDEX cover_letters_graduate_updated_idx
  ON cover_letters (graduate_id, updated_at DESC);
