INSERT INTO technologies (name, slug) VALUES
  ('Python', 'python'),
  ('JavaScript', 'javascript'),
  ('TypeScript', 'typescript'),
  ('Java', 'java'),
  ('CSS', 'css'),
  ('SQL', 'sql'),
  ('PHP', 'php'),
  ('Git', 'git'),
  ('Docker', 'docker'),
  ('React', 'react'),
  ('Node.js', 'nodejs'),
  ('AWS', 'aws'),
  ('Linux', 'linux'),
  ('Laravel', 'laravel'),
  ('Django', 'django')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO soft_skills (name, slug) VALUES
  ('Trabajo en equipo', 'trabajo-en-equipo'),
  ('Comunicacion efectiva', 'comunicacion-efectiva'),
  ('Resolucion de problemas', 'resolucion-de-problemas'),
  ('Adaptabilidad', 'adaptabilidad'),
  ('Pensamiento analitico', 'pensamiento-analitico')
ON CONFLICT (slug) DO NOTHING;
