import bcrypt from "bcrypt";
import { pool } from "../src/config/database.js";

const demoPassword = "Prueba123!";
const adminSeed = {
  email: "admin@example.test",
  firstName: "Administrador",
  lastName: "Sistema",
  registrationCode: "EG-ADMIN-001",
  graduationYear: 2020,
  currentRole: "Administrador del directorio",
  photoUrl: "https://randomuser.me/api/portraits/men/11.jpg",
};

const graduateSeeds = [
  ["ana.mendez@example.test", "Ana", "Mendez", "EG-2026-001", 2021, "Analista de datos", "https://randomuser.me/api/portraits/women/44.jpg"],
  ["bruno.rojas@example.test", "Bruno", "Rojas", "EG-2026-002", 2020, "Desarrollador backend", "https://randomuser.me/api/portraits/men/32.jpg"],
  ["camila.vega@example.test", "Camila", "Vega", "EG-2026-003", 2022, "Analista de sistemas", "https://randomuser.me/api/portraits/women/68.jpg"],
  ["diego.salazar@example.test", "Diego", "Salazar", "EG-2026-004", 2019, "Consultor de tecnologia", "https://randomuser.me/api/portraits/men/46.jpg"],
  ["elena.paz@example.test", "Elena", "Paz", "EG-2026-005", 2023, "Desarrolladora frontend", "https://randomuser.me/api/portraits/women/24.jpg"],
  ["felipe.arias@example.test", "Felipe", "Arias", "EG-2026-006", 2021, "Ingeniero de software", "https://randomuser.me/api/portraits/men/22.jpg"],
  ["gabriela.lima@example.test", "Gabriela", "Lima", "EG-2026-007", 2020, "Especialista en inteligencia de negocios", "https://randomuser.me/api/portraits/women/65.jpg"],
  ["hector.molina@example.test", "Hector", "Molina", "EG-2026-008", 2018, "Administrador de bases de datos", "https://randomuser.me/api/portraits/men/75.jpg"],
  ["ines.castro@example.test", "Ines", "Castro", "EG-2026-009", 2024, "Desarrolladora full stack", "https://randomuser.me/api/portraits/women/90.jpg"],
  ["jorge.navarro@example.test", "Jorge", "Navarro", "EG-2026-010", 2022, "Lider de proyectos", "https://randomuser.me/api/portraits/men/86.jpg"],
];

const projectSeeds = [
  ["Panel de indicadores", "Panel web para visualizar indicadores comerciales."],
  ["Portal de inventario", "Aplicacion para controlar existencias y movimientos."],
  ["Analisis de ventas", "Modelo de datos y reportes para ventas mensuales."],
  ["Agenda de servicios", "Sistema de reservas para servicios profesionales."],
  ["API de catalogos", "API para administrar catalogos y consultas frecuentes."],
  ["Automatizacion de reportes", "Proceso para generar reportes operativos."],
];

const experienceSeeds = [
  ["Analista junior", "DataSur", "2022-01-01", "2023-06-30", "Preparacion de reportes y analisis de datos."],
  ["Desarrollador trainee", "Nube Andina", "2021-03-01", "2022-12-31", "Mantenimiento de servicios web."],
  ["Asistente de sistemas", "Comercial Tarija", "2023-02-01", null, "Soporte de aplicaciones internas."],
  ["Consultor de procesos", "Punto Digital", "2020-05-01", "2022-04-30", "Documentacion y mejora de procesos."],
  ["Desarrolladora web", "Estudio Sur", "2023-01-01", null, "Implementacion de interfaces web."],
  ["Ingeniero de software", "Soluciones Uno", "2022-07-01", null, "Desarrollo y mantenimiento de aplicaciones."],
];

const recommendationSeeds = [
  ["Mariana Flores", "Gerente de proyectos", "Ana demostro criterio analitico y gran responsabilidad."],
  ["Luis Camacho", "Lider tecnico", "Bruno colaboro con el equipo y entrego soluciones confiables."],
  ["Paola Ruiz", "Docente universitaria", "Camila destaco por su capacidad para resolver problemas."],
  ["Ricardo Soto", "Director de operaciones", "Diego aporto orden y claridad a los procesos del equipo."],
  ["Valeria Cruz", "Product manager", "Elena tuvo iniciativa y cuidado por la experiencia de usuario."],
  ["Andres Paredes", "Arquitecto de software", "Felipe realizo aportes tecnicos consistentes y bien documentados."],
];

const coverLetterSeeds = [
  ["Empresa Horizonte", "Analista de datos", "Tarija"],
  ["Nube Andina", "Desarrollador backend", "Tarija"],
  ["Grupo Mercurio", "Analista de sistemas", "Tarija"],
  ["Punto Digital", "Consultor de tecnologia", "Tarija"],
  ["Estudio Sur", "Desarrolladora frontend", "Tarija"],
  ["Soluciones Uno", "Ingeniero de software", "Tarija"],
];

const technologySlugs = ["python", "javascript", "sql", "docker", "react", "nodejs"];
const softSkillSlugs = [
  "trabajo-en-equipo",
  "comunicacion-efectiva",
  "resolucion-de-problemas",
  "adaptabilidad",
  "pensamiento-analitico",
  "trabajo-en-equipo",
];

async function ensureAdminUser(client) {
  const existingAdmin = await client.query(
    "SELECT id FROM users WHERE email = $1",
    [adminSeed.email],
  );
  let adminUserId;
  if (existingAdmin.rowCount === 0) {
    const passwordHash = await bcrypt.hash(demoPassword, 10);
    const created = await client.query(
      "INSERT INTO users (email, password_hash, role, is_active) VALUES ($1, $2, 'admin', TRUE) RETURNING id",
      [adminSeed.email, passwordHash],
    );
    adminUserId = created.rows[0].id;
    console.log(`Usuario administrador creado: ${adminSeed.email} / ${demoPassword}`);
  } else {
    adminUserId = existingAdmin.rows[0].id;
    await client.query(
      "UPDATE users SET role = 'admin', is_active = TRUE WHERE id = $1",
      [adminUserId],
    );
  }

  await client.query(
    `INSERT INTO graduates
      (user_id, registration_code, first_name, last_name, "current_role", graduation_year, professional_summary, photo_url, visibility)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'private')
     ON CONFLICT (user_id) DO UPDATE SET photo_url = COALESCE(graduates.photo_url, EXCLUDED.photo_url)`,
    [
      adminUserId,
      adminSeed.registrationCode,
      adminSeed.firstName,
      adminSeed.lastName,
      adminSeed.currentRole,
      adminSeed.graduationYear,
      "Cuenta administrativa del sistema de registro de egresados.",
      adminSeed.photoUrl,
    ],
  );
}

async function ensureSeedAvatars(client) {
  for (const [, , , registrationCode, , , photoUrl] of graduateSeeds) {
    await client.query(
      `UPDATE graduates
       SET photo_url = $1, updated_at = NOW()
       WHERE registration_code = $2 AND (photo_url IS NULL OR photo_url = '')`,
      [photoUrl, registrationCode],
    );
  }
}

async function runSeed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(716204, 1)");
    await ensureAdminUser(client);

    const existingData = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM graduate_technologies
        UNION ALL SELECT 1 FROM graduate_soft_skills
        UNION ALL SELECT 1 FROM projects
        UNION ALL SELECT 1 FROM experiences
        UNION ALL SELECT 1 FROM recommendations
        UNION ALL SELECT 1 FROM cover_letters
      ) AS has_data
    `);

    if (existingData.rows[0].has_data) {
      await ensureSeedAvatars(client);
      console.log("La base ya contiene datos; se omiten las semillas.");
      await client.query("COMMIT");
      return;
    }

    const passwordHash = await bcrypt.hash(demoPassword, 10);
    const graduates = [];
    for (const [email, firstName, lastName, registrationCode, graduationYear, currentRole, photoUrl] of graduateSeeds) {
      const user = await client.query(
        "INSERT INTO users (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email RETURNING id",
        [email, passwordHash],
      );
      const graduate = await client.query(
        `INSERT INTO graduates
          (user_id, registration_code, first_name, last_name, "current_role", graduation_year,
           professional_summary, photo_url, visibility)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'public')
         ON CONFLICT (user_id) DO UPDATE SET photo_url = COALESCE(graduates.photo_url, EXCLUDED.photo_url)
         RETURNING id`,
        [
          user.rows[0].id,
          registrationCode,
          firstName,
          lastName,
          currentRole,
          graduationYear,
          `${firstName} es profesional egresado con interes en tecnologia y mejora continua.`,
          photoUrl,
        ],
      );
      graduates.push(graduate.rows[0].id);
    }

    const technologies = await client.query(
      "SELECT id, slug FROM technologies WHERE slug = ANY($1::text[])",
      [technologySlugs],
    );
    const technologyIds = new Map(technologies.rows.map((row) => [row.slug, row.id]));
    const softSkills = await client.query(
      "SELECT id, slug FROM soft_skills WHERE slug = ANY($1::text[])",
      [[...new Set(softSkillSlugs)]],
    );
    const softSkillIds = new Map(softSkills.rows.map((row) => [row.slug, row.id]));

    for (let index = 0; index < 6; index += 1) {
      const technologyId = technologyIds.get(technologySlugs[index]);
      const softSkillId = softSkillIds.get(softSkillSlugs[index]);
      if (!technologyId || !softSkillId) {
        throw new Error("Faltan catalogos requeridos; ejecuta las migraciones antes de sembrar.");
      }
      await client.query(
        `INSERT INTO graduate_technologies (graduate_id, technology_id, proficiency, display_order)
         VALUES ($1, $2, $3, 0)`,
        [graduates[index], technologyId, (index % 5) + 1],
      );
      await client.query(
        `INSERT INTO graduate_soft_skills (graduate_id, soft_skill_id, display_order)
         VALUES ($1, $2, 0)`,
        [graduates[index], softSkillId],
      );
      await client.query(
        `INSERT INTO projects (graduate_id, title, description, display_order)
         VALUES ($1, $2, $3, 0)`,
        [graduates[index], ...projectSeeds[index]],
      );
      await client.query(
        `INSERT INTO experiences
          (graduate_id, position, organization, start_date, end_date, is_current, description, display_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 0)`,
        [
          graduates[index],
          experienceSeeds[index][0],
          experienceSeeds[index][1],
          experienceSeeds[index][2],
          experienceSeeds[index][3],
          experienceSeeds[index][3] === null,
          experienceSeeds[index][4],
        ],
      );
      await client.query(
        `INSERT INTO recommendations (graduate_id, author_name, author_role, message, status)
         VALUES ($1, $2, $3, $4, 'published')`,
        [graduates[index], ...recommendationSeeds[index]],
      );

      const coverLetter = await client.query(
        `INSERT INTO cover_letters
          (graduate_id, full_name, email, sending_city, company_name, target_position,
           career, university, relevant_experience, motivation, value_proposition)
         VALUES ($1, $2, $3, 'Tarija', $4, $5, 'Ingenieria Comercial',
                 'Universidad Autonoma Juan Misael Saracho', $6, $7, $8)
         RETURNING id`,
        [
          graduates[index],
          `${graduateSeeds[index][1]} ${graduateSeeds[index][2]}`,
          graduateSeeds[index][0],
          coverLetterSeeds[index][0],
          coverLetterSeeds[index][1],
          experienceSeeds[index][4],
          `Me interesa aportar al equipo de ${coverLetterSeeds[index][0]}.`,
          "Puedo contribuir con responsabilidad, aprendizaje continuo y colaboracion.",
        ],
      );
      await client.query(
        `INSERT INTO cover_letter_technologies (cover_letter_id, technology_id, display_order)
         VALUES ($1, $2, 0)`,
        [coverLetter.rows[0].id, technologyId],
      );
      await client.query(
        `INSERT INTO cover_letter_soft_skills (cover_letter_id, soft_skill_id, display_order)
         VALUES ($1, $2, 0)`,
        [coverLetter.rows[0].id, softSkillId],
      );
    }

    await client.query("COMMIT");
    console.log("Semillas cargadas: 10 usuarios y 6 registros por tabla relacionada.");
    console.log(`Clave de prueba para todos los usuarios: ${demoPassword}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

if (process.argv[1] && process.argv[1].endsWith("seed.js")) {
  runSeed()
    .catch((err) => {
      console.error("Error al cargar semillas:", err);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}

export { runSeed };
