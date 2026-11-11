import bcrypt from "bcrypt";
import { pool } from "../src/config/database.js";

const demoPassword = "Prueba123!";

const newGraduateSeeds = [
  {
    code: "EG-2026-011",
    firstName: "Valeria",
    lastName: "Ríos",
    email: "valeria.rios@example.test",
    personalEmail: "valeria.rios@example.test",
    institutionalEmail: "valeria.rios@uajms.edu.bo",
    phone: "+591 71239801",
    graduationYear: 2024,
    currentRole: "DevOps & Cloud Engineer",
    photoUrl: "https://randomuser.me/api/portraits/women/17.jpg",
    summary:
      "Ingeniera de sistemas apasionada por la infraestructura en la nube, automatización de despliegues y observabilidad de microservicios. Especializada en cultura DevOps, pipelines CI/CD y despliegues contenerizados de alta disponibilidad en AWS y entornos híbridos.",
    professionalLinks: [
      { type: "linkedin", url: "https://linkedin.com/in/valeria-rios-devops" },
      { type: "github", url: "https://github.com/valeriarios" },
      { type: "portfolio", url: "https://valeriarios.dev" },
    ],
    languages: [
      { slug: "espanol", level: "nativo" },
      { slug: "ingles", level: "avanzado" },
    ],
    technologies: ["aws", "docker", "linux", "git", "python"],
    softSkills: ["resolucion-de-problemas", "trabajo-en-equipo", "adaptabilidad"],
    certificates: [
      { title: "Licenciatura en Ingeniería Informática", formationType: "bachelor", issuer: "UAJMS", issueDate: "2024-03-15" },
      { title: "AWS Certified Solutions Architect", formationType: "courses", issuer: "Amazon Web Services", issueDate: "2024-08-20" },
    ],
    experiences: [
      {
        category: "work",
        position: "DevOps Engineer",
        organization: "Nube Andina S.R.L.",
        startDate: "2024-02-01",
        endDate: null,
        dateFormat: "month",
        isCurrent: true,
        description:
          "Diseño e implementación de pipelines automatizados con GitHub Actions y Terraform. Monitoreo proactivo con Prometheus y Grafana para asegurar 99.9% de uptime en plataformas financieras.",
      },
      {
        category: "pre_graduate",
        position: "Líder de Infraestructura Estudiantil",
        organization: "Sociedad Científica de Informática UAJMS",
        startDate: "2022-03-01",
        endDate: "2023-11-30",
        dateFormat: "month",
        isCurrent: false,
        description:
          "Administración de servidores virtuales Linux para proyectos de estudiantes e impartición de talleres de Docker y Git para nuevos alumnos de la carrera.",
      },
    ],
    projects: [
      {
        title: "Infraestructura CI/CD Multi-Cloud",
        description:
          "Arquitectura declarativa de nube con Terraform y clústeres Kubernetes con auto-scaling para despliegues sin tiempo de inactividad (Zero Downtime Deployments).",
        url: "https://github.com/valeriarios/cloud-cicd-infra",
      },
    ],
    recommendations: [
      {
        authorName: "Carlos Villena",
        authorRole: "CTO en Nube Andina",
        message: "Valeria demostró un nivel técnico sobresaliente en la automatización de nuestros sistemas y gran capacidad de trabajo bajo presión.",
      },
    ],
  },
  {
    code: "EG-2026-012",
    firstName: "Lucas",
    lastName: "Morales",
    email: "lucas.morales@example.test",
    personalEmail: "lucas.morales@example.test",
    institutionalEmail: "lucas.morales@uajms.edu.bo",
    phone: "+591 72345678",
    graduationYear: 2023,
    currentRole: "Data Scientist & Machine Learning Engineer",
    photoUrl: "https://randomuser.me/api/portraits/men/33.jpg",
    summary:
      "Científico de datos enfocado en modelos predictivos, procesamiento de lenguaje natural y visión computacional. Con sólida experiencia en análisis estadístico, optimización de pipelines de datos y puesta en producción de modelos de Machine Learning.",
    professionalLinks: [
      { type: "linkedin", url: "https://linkedin.com/in/lucas-morales-ds" },
      { type: "github", url: "https://github.com/lucasmorales-data" },
      { type: "kaggle", url: "https://kaggle.com/lucasmorales" },
    ],
    languages: [
      { slug: "espanol", level: "nativo" },
      { slug: "ingles", level: "intermedio" },
      { slug: "portugues", level: "basico" },
    ],
    technologies: ["python", "sql", "docker", "react"],
    softSkills: ["pensamiento-analitico", "resolucion-de-problemas", "comunicacion-efectiva"],
    certificates: [
      { title: "Licenciatura en Ingeniería Informática", formationType: "bachelor", issuer: "UAJMS", issueDate: "2023-04-10" },
      { title: "Diplomado en Ciencia de Datos Aplicada", formationType: "diploma", issuer: "Universidad Mayor de San Andrés", issueDate: "2023-11-25" },
    ],
    experiences: [
      {
        category: "work",
        position: "Data Scientist",
        organization: "DataMetrics Bolivia",
        startDate: "2023-06-01",
        endDate: null,
        dateFormat: "month",
        isCurrent: true,
        description:
          "Desarrollo de modelos predictivos de fuga de clientes con XGBoost y redes neuronales. Implementación de APIs con FastAPI y contenedorización para consumo en tiempo real por el equipo de producto.",
      },
      {
        category: "academic",
        position: "Auxiliar de Cátedra en Inteligencia Artificial",
        organization: "UAJMS - Facultad de Ciencias y Tecnología",
        startDate: "2022-02-01",
        endDate: "2022-12-15",
        dateFormat: "month",
        isCurrent: false,
        description:
          "Guía y asesoramiento en prácticas de laboratorio sobre regresión, árboles de decisión y redes neuronales para más de 40 estudiantes universitarios.",
      },
    ],
    projects: [
      {
        title: "Predictor de Demanda Energética",
        description:
          "Modelo de series de tiempo para estimación de consumo eléctrico regional con dashboards interactivos para toma de decisiones operativas.",
        url: "https://github.com/lucasmorales-data/energy-demand-forecast",
      },
    ],
    recommendations: [
      {
        authorName: "Dra. Patricia Vaca",
        authorRole: "Investigadora en Inteligencia Artificial",
        message: "Lucas posee un excelente rigor analítico y una capacidad pedagógica excepcional para estructurar proyectos de datos complejos.",
      },
    ],
  },
  {
    code: "EG-2026-013",
    firstName: "Sofía",
    lastName: "Benítez",
    email: "sofia.benitez@example.test",
    personalEmail: "sofia.benitez@example.test",
    institutionalEmail: "sofia.benitez@uajms.edu.bo",
    phone: "+591 73456789",
    graduationYear: 2022,
    currentRole: "QA Automation Lead",
    photoUrl: "https://randomuser.me/api/portraits/women/42.jpg",
    summary:
      "Líder de aseguramiento de calidad con pasión por la excelencia de software, pruebas continuas y testing funcional y no funcional. Especializada en frameworks de automatización E2E, pruebas de carga y métricas de calidad de código.",
    professionalLinks: [
      { type: "linkedin", url: "https://linkedin.com/in/sofia-benitez-qa" },
      { type: "github", url: "https://github.com/sofiabenitez-qa" },
    ],
    languages: [
      { slug: "espanol", level: "nativo" },
      { slug: "ingles", level: "avanzado" },
    ],
    technologies: ["javascript", "python", "git", "docker"],
    softSkills: ["trabajo-en-equipo", "comunicacion-efectiva", "pensamiento-analitico"],
    certificates: [
      { title: "Licenciatura en Ingeniería Informática", formationType: "bachelor", issuer: "UAJMS", issueDate: "2022-06-18" },
      { title: "Certificación ISTQB Certified Tester Foundation", formationType: "courses", issuer: "ISTQB", issueDate: "2022-10-05" },
    ],
    experiences: [
      {
        category: "work",
        position: "QA Automation Engineer",
        organization: "Software Andino Corp",
        startDate: "2022-08-01",
        endDate: null,
        dateFormat: "month",
        isCurrent: true,
        description:
          "Diseño de suites de pruebas automáticas con Playwright y Cypress integradas al pipeline de integración continua, reduciendo los tiempos de regresión en un 65%.",
      },
    ],
    projects: [
      {
        title: "Framework Automatizado de Pruebas E2E",
        description:
          "Plantilla modular basada en Page Object Model con generación de reportes automáticos en Allure y ejecución distribuida en contenedores Docker.",
        url: "https://github.com/sofiabenitez-qa/playwright-e2e-template",
      },
    ],
    recommendations: [
      {
        authorName: "Martín Calvimonte",
        authorRole: "Director de Ingeniería en Software Andino",
        message: "Sofía transformó la cultura de calidad de nuestra empresa elevando el estándar de cada release de producto.",
      },
    ],
  },
  {
    code: "EG-2026-014",
    firstName: "Matías",
    lastName: "Alarcón",
    email: "matias.alarcon@example.test",
    personalEmail: "matias.alarcon@example.test",
    institutionalEmail: "matias.alarcon@uajms.edu.bo",
    phone: "+591 74567890",
    graduationYear: 2021,
    currentRole: "Arquitecto de Soluciones Cloud & Backend",
    photoUrl: "https://randomuser.me/api/portraits/men/52.jpg",
    summary:
      "Arquitecto de software con más de 4 años de experiencia diseñando arquitecturas basadas en eventos, microservicios resilientes y bases de datos distribuidas. Comprometido con patrones de diseño DDD, Clean Architecture y seguridad cloud.",
    professionalLinks: [
      { type: "linkedin", url: "https://linkedin.com/in/matias-alarcon-arch" },
      { type: "github", url: "https://github.com/matiasalarcon" },
      { type: "portfolio", url: "https://alarcon.tech" },
    ],
    languages: [
      { slug: "espanol", level: "nativo" },
      { slug: "ingles", level: "avanzado" },
    ],
    technologies: ["nodejs", "sql", "aws", "docker", "javascript"],
    softSkills: ["resolucion-de-problemas", "pensamiento-analitico", "adaptabilidad"],
    certificates: [
      { title: "Licenciatura en Ingeniería Informática", formationType: "bachelor", issuer: "UAJMS", issueDate: "2021-05-20" },
      { title: "Maestría en Arquitectura y Seguridad de Software", formationType: "master", issuer: "Universidad Politécnica de Madrid", issueDate: "2023-12-10" },
    ],
    experiences: [
      {
        category: "work",
        position: "Lead Cloud Architect",
        organization: "Apex Cloud Services",
        startDate: "2021-07-01",
        endDate: null,
        dateFormat: "month",
        isCurrent: true,
        description:
          "Liderazgo técnico en la migración de sistemas monolíticos hacia arquitecturas serverless en AWS, optimizando costos operativos en un 40% y mejorando la tolerancia a fallos.",
      },
      {
        category: "academic",
        position: "Expositor en Congreso Internacional de TI",
        organization: "Congreso Boliviano de Informática",
        startDate: "2023-09-15",
        endDate: "2023-09-17",
        dateFormat: "day",
        isCurrent: false,
        description:
          "Ponente magistral sobre patrones modernos de persistencia y consistencia eventual en sistemas distribuidos de alto volumen transaccional.",
      },
    ],
    projects: [
      {
        title: "Motor de Eventos Serverless",
        description:
          "Arquitectura orientada a eventos con AWS EventBridge, SQS y Lambdas para procesamiento asíncrono de órdenes de compra con alta concurrencia.",
        url: "https://github.com/matiasalarcon/event-driven-engine",
      },
    ],
    recommendations: [],
  },
  {
    code: "EG-2026-015",
    firstName: "Camila",
    lastName: "Barrientos",
    email: "camila.barrientos@example.test",
    personalEmail: "camila.barrientos@example.test",
    institutionalEmail: "camila.barrientos@uajms.edu.bo",
    phone: "+591 75678901",
    graduationYear: 2023,
    currentRole: "Mobile Developer & Frontend Engineer",
    photoUrl: "https://randomuser.me/api/portraits/women/60.jpg",
    summary:
      "Desarrolladora enfocada en experiencias móviles interactivas, fluidas y accesibles tanto en iOS como en Android. Experta en React Native, consumo de APIs GraphQL/REST y diseño responsivo.",
    professionalLinks: [
      { type: "linkedin", url: "https://linkedin.com/in/camilabarrientos-dev" },
      { type: "github", url: "https://github.com/camilabarrientos" },
    ],
    languages: [
      { slug: "espanol", level: "nativo" },
      { slug: "ingles", level: "intermedio" },
    ],
    technologies: ["react", "javascript", "css", "git"],
    softSkills: ["adaptabilidad", "trabajo-en-equipo", "comunicacion-efectiva"],
    certificates: [
      { title: "Licenciatura en Ingeniería Informática", formationType: "bachelor", issuer: "UAJMS", issueDate: "2023-03-22" },
      { title: "Diplomado en Desarrollo de Aplicaciones Móviles Multiplataforma", formationType: "diploma", issuer: "Universidad Católica Boliviana", issueDate: "2023-10-15" },
    ],
    experiences: [
      {
        category: "work",
        position: "Desarrolladora Mobile",
        organization: "TechMove App Studio",
        startDate: "2023-04-01",
        endDate: null,
        dateFormat: "month",
        isCurrent: true,
        description:
          "Construcción y publicación de apps en Google Play y App Store con React Native. Implementación de autenticación biométrica, mapas en vivo y notificaciones push personalizadas.",
      },
      {
        category: "pre_graduate",
        position: "Desarrolladora en Proyecto de Grado",
        organization: "UAJMS - Hospital San Juan de Dios",
        startDate: "2022-04-01",
        endDate: "2022-12-20",
        dateFormat: "month",
        isCurrent: false,
        description:
          "Creación de aplicación móvil para seguimiento de citas ambulatorias y recordatorios de medicación para adultos mayores con interfaz de accesibilidad.",
      },
    ],
    projects: [
      {
        title: "App de Salud y Turnos Médicos",
        description:
          "Plataforma móvil con calendario sincronizado, recordatorios automáticos y chat directo con especialistas de salud.",
        url: "https://github.com/camilabarrientos/salud-app-mobile",
      },
    ],
    recommendations: [],
  },
  {
    code: "EG-2026-016",
    firstName: "Andrés",
    lastName: "Guzmán",
    email: "andres.guzman@example.test",
    personalEmail: "andres.guzman@example.test",
    institutionalEmail: "andres.guzman@uajms.edu.bo",
    phone: "+591 76789012",
    graduationYear: 2020,
    currentRole: "Especialista en Ciberseguridad & Redes",
    photoUrl: "https://randomuser.me/api/portraits/men/68.jpg",
    summary:
      "Ingeniero informático especializado en seguridad de la información, análisis de vulnerabilidades, auditorías de redes y mitigación de amenazas cibernéticas. Amplio dominio en sistemas Linux, firewalls y hardening de servidores empresariales.",
    professionalLinks: [
      { type: "linkedin", url: "https://linkedin.com/in/andres-guzman-sec" },
      { type: "github", url: "https://github.com/andresguzman-sec" },
      { type: "leetcode", url: "https://leetcode.com/andresguzman" },
    ],
    languages: [
      { slug: "espanol", level: "nativo" },
      { slug: "ingles", level: "avanzado" },
      { slug: "frances", level: "basico" },
    ],
    technologies: ["linux", "python", "git", "docker"],
    softSkills: ["resolucion-de-problemas", "pensamiento-analitico", "adaptabilidad"],
    certificates: [
      { title: "Licenciatura en Ingeniería Informática", formationType: "bachelor", issuer: "UAJMS", issueDate: "2020-05-15" },
      { title: "Especialidad en Seguridad Informática y Pentesting", formationType: "specialty", issuer: "Universidad del Valle", issueDate: "2022-04-10" },
      { title: "Certified Ethical Hacker (CEH)", formationType: "courses", issuer: "EC-Council", issueDate: "2023-01-20" },
    ],
    experiences: [
      {
        category: "work",
        position: "Consultor de Ciberseguridad",
        organization: "CyberDefenders Bolivia",
        startDate: "2020-08-01",
        endDate: null,
        dateFormat: "month",
        isCurrent: true,
        description:
          "Ejecución de auditorías de caja negra y caja blanca en sistemas bancarios y gubernamentales, identificando y mitigando vectores críticos de vulnerabilidad.",
      },
    ],
    projects: [
      {
        title: "Escáner Automatizado de Puertos y Servicios",
        description:
          "Herramienta en Python para auditorías defensivas de red con reportes automáticos en PDF y alertas ante puertos inseguros abiertos.",
        url: "https://github.com/andresguzman-sec/port-auditor",
      },
    ],
    recommendations: [],
  },
  {
    code: "EG-2026-017",
    firstName: "Mariana",
    lastName: "Torrico",
    email: "mariana.torrico@example.test",
    personalEmail: "mariana.torrico@example.test",
    institutionalEmail: "mariana.torrico@uajms.edu.bo",
    phone: "+591 77890123",
    graduationYear: 2025,
    currentRole: "Frontend Tech Lead & Diseñadora Web",
    photoUrl: "https://randomuser.me/api/portraits/women/65.jpg",
    summary:
      "Graduada con honores con visión integral de desarrollo frontend moderno, sistemas de diseño, accesibilidad WCAG y rendimiento web. Con experiencia liderando iniciativas de UI interactivas con React, TypeScript y Tailwind CSS.",
    professionalLinks: [
      { type: "linkedin", url: "https://linkedin.com/in/mariana-torrico" },
      { type: "github", url: "https://github.com/marianatorrico" },
      { type: "portfolio", url: "https://marianatorrico.design" },
      { type: "behance", url: "https://behance.net/marianatorrico" },
    ],
    languages: [
      { slug: "espanol", level: "nativo" },
      { slug: "ingles", level: "avanzado" },
      { slug: "portugues", level: "intermedio" },
    ],
    technologies: ["react", "javascript", "css", "git", "nodejs"],
    softSkills: ["comunicacion-efectiva", "trabajo-en-equipo", "resolucion-de-problemas"],
    certificates: [
      { title: "Licenciatura en Ingeniería Informática (Mención de Honor)", formationType: "bachelor", issuer: "UAJMS", issueDate: "2025-02-28" },
      { title: "Meta Front-End Developer Professional Certificate", formationType: "courses", issuer: "Meta / Coursera", issueDate: "2024-11-15" },
    ],
    experiences: [
      {
        category: "work",
        position: "Frontend Tech Lead",
        organization: "Vanguardia Digital Studio",
        startDate: "2024-03-01",
        endDate: null,
        dateFormat: "month",
        isCurrent: true,
        description:
          "Arquitectura de interfaz para aplicaciones web complejas, creación del Design System corporativo y mentoría a desarrolladores junior del equipo.",
      },
      {
        category: "academic",
        position: "Tutor en Programación Web",
        organization: "Club de Desarrollo UAJMS",
        startDate: "2023-03-01",
        endDate: "2024-10-31",
        dateFormat: "month",
        isCurrent: false,
        description:
          "Organización de bootcamps introductorios de HTML5, CSS3 moderno y React para nuevos integrantes del club.",
      },
    ],
    projects: [
      {
        title: "Design System Accesible 'Aurora'",
        description:
          "Biblioteca de componentes React totalmente accesibles (WCAG AAA), con soporte para temas oscuros/claros y cobertura de pruebas al 98%.",
        url: "https://github.com/marianatorrico/aurora-design-system",
      },
    ],
    recommendations: [],
  },
  {
    code: "EG-2026-018",
    firstName: "Rodrigo",
    lastName: "Cáceres",
    email: "rodrigo.caceres@example.test",
    personalEmail: "rodrigo.caceres@example.test",
    institutionalEmail: "rodrigo.caceres@uajms.edu.bo",
    phone: "+591 78901234",
    graduationYear: 2019,
    currentRole: "Tech Lead Full Stack & Consultor TI",
    photoUrl: "https://randomuser.me/api/portraits/men/78.jpg",
    summary:
      "Ingeniero informático con amplia trayectoria liderando equipos de desarrollo de software empresarial, transformación digital y modernización de plataformas legacy. Experiencia en Node.js, React, Docker y bases de datos relacionales robustas.",
    professionalLinks: [
      { type: "linkedin", url: "https://linkedin.com/in/rodrigo-caceres-tl" },
      { type: "github", url: "https://github.com/rodrigocaceres" },
    ],
    languages: [
      { slug: "espanol", level: "nativo" },
      { slug: "ingles", level: "intermedio" },
    ],
    technologies: ["nodejs", "react", "sql", "docker", "git"],
    softSkills: ["trabajo-en-equipo", "comunicacion-efectiva", "pensamiento-analitico"],
    certificates: [
      { title: "Licenciatura en Ingeniería Informática", formationType: "bachelor", issuer: "UAJMS", issueDate: "2019-06-25" },
      { title: "Diplomado en Gestión de Proyectos Tecnológicos", formationType: "diploma", issuer: "Universidad Privada Boliviana", issueDate: "2021-08-10" },
    ],
    experiences: [
      {
        category: "work",
        position: "Tech Lead",
        organization: "InnovaCorp Sur",
        startDate: "2019-10-01",
        endDate: null,
        dateFormat: "month",
        isCurrent: true,
        description:
          "Dirección técnica de 8 desarrolladores en la creación de soluciones ERP web, optimizando tiempos de entrega con metodologías ágiles Scrum.",
      },
    ],
    projects: [
      {
        title: "Sistema ERP para Distribución Mayorista",
        description:
          "Plataforma modular con facturación computarizada, gestión de inventarios multialmacén y reportes gerenciales en tiempo real.",
        url: "https://github.com/rodrigocaceres/erp-distribution-platform",
      },
    ],
    recommendations: [],
  },
  {
    code: "EG-2026-019",
    firstName: "Luciana",
    lastName: "Fernández",
    email: "luciana.fernandez@example.test",
    personalEmail: "luciana.fernandez@example.test",
    institutionalEmail: "luciana.fernandez@uajms.edu.bo",
    phone: "+591 79012345",
    graduationYear: 2022,
    currentRole: "Data Engineer & Pipeline Architect",
    photoUrl: "https://randomuser.me/api/portraits/women/72.jpg",
    summary:
      "Ingeniera de datos especializada en el diseño y mantenimiento de pipelines de datos masivos (ETL/ELT), data warehouses en la nube y modelado analítico para Business Intelligence.",
    professionalLinks: [
      { type: "linkedin", url: "https://linkedin.com/in/luciana-fernandez-de" },
      { type: "github", url: "https://github.com/lucianafernandez-data" },
      { type: "gitlab", url: "https://gitlab.com/lucianafernandez" },
    ],
    languages: [
      { slug: "espanol", level: "nativo" },
      { slug: "ingles", level: "avanzado" },
    ],
    technologies: ["python", "sql", "linux", "docker"],
    softSkills: ["pensamiento-analitico", "resolucion-de-problemas", "adaptabilidad"],
    certificates: [
      { title: "Licenciatura en Ingeniería Informática", formationType: "bachelor", issuer: "UAJMS", issueDate: "2022-04-12" },
      { title: "Diplomado en Big Data y Procesamiento Distribuido", formationType: "diploma", issuer: "UAJMS", issueDate: "2023-07-20" },
    ],
    experiences: [
      {
        category: "work",
        position: "Data Engineer",
        organization: "DataPulse Analytics",
        startDate: "2022-07-01",
        endDate: null,
        dateFormat: "month",
        isCurrent: true,
        description:
          "Construcción de pipelines con Apache Airflow y PostgreSQL para ingesta de millones de registros diarios, garantizando integridad y disponibilidad analítica.",
      },
    ],
    projects: [
      {
        title: "Pipeline ETL Automatizado para Telecom",
        description:
          "Flujo de ingesta y transformación de datos con validaciones automáticas de calidad y alertas en caso de anomalías en los datasets.",
        url: "https://github.com/lucianafernandez-data/telecom-etl-pipeline",
      },
    ],
    recommendations: [],
  },
  {
    code: "EG-2026-020",
    firstName: "Gabriel",
    lastName: "Soliz",
    email: "gabriel.soliz@example.test",
    personalEmail: "gabriel.soliz@example.test",
    institutionalEmail: "gabriel.soliz@uajms.edu.bo",
    phone: "+591 70123456",
    graduationYear: 2021,
    currentRole: "Backend Engineer & REST APIs",
    photoUrl: "https://randomuser.me/api/portraits/men/82.jpg",
    summary:
      "Desarrollador backend con enfoque en arquitectura de servicios, rendimiento en bases de datos y seguridad de APIs. Especializado en Node.js, PHP/Laravel y PostgreSQL.",
    professionalLinks: [
      { type: "linkedin", url: "https://linkedin.com/in/gabriel-soliz-backend" },
      { type: "github", url: "https://github.com/gabrielsoliz" },
    ],
    languages: [
      { slug: "espanol", level: "nativo" },
      { slug: "portugues", level: "intermedio" },
    ],
    technologies: ["nodejs", "php", "laravel", "sql", "git"],
    softSkills: ["resolucion-de-problemas", "trabajo-en-equipo", "adaptabilidad"],
    certificates: [
      { title: "Licenciatura en Ingeniería Informática", formationType: "bachelor", issuer: "UAJMS", issueDate: "2021-08-30" },
    ],
    experiences: [
      {
        category: "work",
        position: "Backend Developer",
        organization: "Soluciones Digitales Tarija",
        startDate: "2021-11-01",
        endDate: null,
        dateFormat: "month",
        isCurrent: true,
        description:
          "Implementación de servicios RESTful y Webhooks para pasarelas de pago bolivianas (QR Simple, tarjetas), asegurando transacciones atómicas y seguras.",
      },
    ],
    projects: [
      {
        title: "Gateway de Pagos QR Integrado",
        description:
          "Microservicio para generación y verificación de cobros inmediatos con reconciliación bancaria automatizada.",
        url: "https://github.com/gabrielsoliz/qr-payment-gateway",
      },
    ],
    recommendations: [],
  },
  {
    code: "EG-2026-021",
    firstName: "Natalia",
    lastName: "Mendoza",
    email: "natalia.mendoza@example.test",
    personalEmail: "natalia.mendoza@example.test",
    institutionalEmail: "natalia.mendoza@uajms.edu.bo",
    phone: "+591 71122334",
    graduationYear: 2023,
    currentRole: "Product Designer UI/UX & Frontend",
    photoUrl: "https://randomuser.me/api/portraits/women/48.jpg",
    summary:
      "Diseñadora de producto digital y desarrolladora frontend apasionada por crear interfaces elegantes, intuitivas y centradas en el usuario. Con experiencia en prototipado, investigación con usuarios y desarrollo web responsivo.",
    professionalLinks: [
      { type: "linkedin", url: "https://linkedin.com/in/natalia-mendoza-ui" },
      { type: "portfolio", url: "https://nataliamendoza.design" },
      { type: "behance", url: "https://behance.net/nataliamendoza" },
    ],
    languages: [
      { slug: "espanol", level: "nativo" },
      { slug: "ingles", level: "intermedio" },
      { slug: "frances", level: "intermedio" },
    ],
    technologies: ["css", "javascript", "react", "git"],
    softSkills: ["comunicacion-efectiva", "pensamiento-analitico", "trabajo-en-equipo"],
    certificates: [
      { title: "Licenciatura en Ingeniería Informática", formationType: "bachelor", issuer: "UAJMS", issueDate: "2023-05-18" },
      { title: "Certificación Profesional en Diseño de Experiencia de Usuario (UX)", formationType: "courses", issuer: "Google / Coursera", issueDate: "2023-11-02" },
    ],
    experiences: [
      {
        category: "work",
        position: "UI/UX Designer & Frontend",
        organization: "Creativa Lab",
        startDate: "2023-06-01",
        endDate: null,
        dateFormat: "month",
        isCurrent: true,
        description:
          "Investigación de usuarios, diseño de wireframes y prototipos de alta fidelidad, así como maquetación responsiva con CSS moderno y React.",
      },
    ],
    projects: [
      {
        title: "Rediseño de Portal de Trámites Universitarios",
        description:
          "Propuesta de UX/UI y prototipo funcional para simplificar la gestión académica de estudiantes con un 70% menos de clics por trámite.",
        url: "https://github.com/nataliamendoza/portal-tramites-ux",
      },
    ],
    recommendations: [],
  },
  {
    code: "EG-2026-022",
    firstName: "Santiago",
    lastName: "Quiroga",
    email: "santiago.quiroga@example.test",
    personalEmail: "santiago.quiroga@example.test",
    institutionalEmail: "santiago.quiroga@uajms.edu.bo",
    phone: "+591 72233445",
    graduationYear: 2020,
    currentRole: "Scrum Master & Agile Coach",
    photoUrl: "https://randomuser.me/api/portraits/men/44.jpg",
    summary:
      "Ingeniero informático y facilitador ágil con amplia experiencia impulsando marcos Scrum y Kanban en equipos de ingeniería de software. Enfocado en la entrega continua de valor, remoción de impedimentos y mejora del clima de colaboración técnica.",
    professionalLinks: [
      { type: "linkedin", url: "https://linkedin.com/in/santiago-quiroga-agile" },
      { type: "github", url: "https://github.com/santiagoquiroga" },
    ],
    languages: [
      { slug: "espanol", level: "nativo" },
      { slug: "ingles", level: "avanzado" },
    ],
    technologies: ["git", "python", "react", "sql"],
    softSkills: ["comunicacion-efectiva", "trabajo-en-equipo", "adaptabilidad", "resolucion-de-problemas"],
    certificates: [
      { title: "Licenciatura en Ingeniería Informática", formationType: "bachelor", issuer: "UAJMS", issueDate: "2020-07-20" },
      { title: "Professional Scrum Master I (PSM I)", formationType: "courses", issuer: "Scrum.org", issueDate: "2021-09-14" },
    ],
    experiences: [
      {
        category: "work",
        position: "Scrum Master",
        organization: "AgileGlobal Tech",
        startDate: "2021-01-15",
        endDate: null,
        dateFormat: "month",
        isCurrent: true,
        description:
          "Facilitación de ceremonias ágiles (Daily, Sprint Planning, Retrospective) para 2 equipos multidisciplinarios remotos, incrementando la velocidad del sprint en un 28%.",
      },
    ],
    projects: [
      {
        title: "Tablero Ágil de Métricas de Sprint",
        description:
          "Dashboard web interactivo con burndown charts, lead time y cycle time para análisis de flujo de trabajo ágil.",
        url: "https://github.com/santiagoquiroga/agile-metrics-board",
      },
    ],
    recommendations: [],
  },
];

async function seedMoreProfiles() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    console.log("Iniciando inserción aditiva de 12 nuevos perfiles...");

    // 1. Obtener catálogos necesarios
    const techResult = await client.query("SELECT id, slug FROM technologies WHERE is_active = TRUE");
    const techMap = new Map(techResult.rows.map((r) => [r.slug, r.id]));

    const softResult = await client.query("SELECT id, slug FROM soft_skills WHERE is_active = TRUE");
    const softMap = new Map(softResult.rows.map((r) => [r.slug, r.id]));

    const langResult = await client.query("SELECT id, slug FROM languages WHERE is_active = TRUE");
    const langMap = new Map(langResult.rows.map((r) => [r.slug, r.id]));

    const passwordHash = await bcrypt.hash(demoPassword, 10);
    let insertedCount = 0;
    let skippedCount = 0;

    for (const seed of newGraduateSeeds) {
      // Verificar si ya existe por código o por email
      const existingUser = await client.query("SELECT id FROM users WHERE email = $1", [seed.email]);
      const existingGrad = await client.query("SELECT id FROM graduates WHERE registration_code = $1", [seed.code]);

      if (existingUser.rowCount > 0 || existingGrad.rowCount > 0) {
        console.log(`[OMITIDO] El perfil ${seed.code} (${seed.email}) ya existe. Se mantiene intacto.`);
        skippedCount += 1;
        continue;
      }

      // Crear usuario
      const userRes = await client.query(
        "INSERT INTO users (email, password_hash, role, is_active) VALUES ($1, $2, 'graduate', TRUE) RETURNING id",
        [seed.email, passwordHash]
      );
      const userId = userRes.rows[0].id;

      // Crear egresado
      const gradRes = await client.query(
        `INSERT INTO graduates (
          user_id, registration_code, first_name, last_name, "current_role", graduation_year,
          professional_summary, photo_url, phone, personal_email, institutional_email, professional_links, visibility
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'public')
        RETURNING id`,
        [
          userId,
          seed.code,
          seed.firstName,
          seed.lastName,
          seed.currentRole,
          seed.graduationYear,
          seed.summary,
          seed.photoUrl,
          seed.phone,
          seed.personalEmail,
          seed.institutionalEmail,
          JSON.stringify(seed.professionalLinks || []),
        ]
      );
      const graduateId = gradRes.rows[0].id;

      // Idiomas
      let langOrder = 0;
      for (const l of seed.languages || []) {
        const langId = langMap.get(l.slug);
        if (langId) {
          await client.query(
            "INSERT INTO graduate_languages (graduate_id, language_id, level, display_order) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING",
            [graduateId, langId, l.level, langOrder]
          );
          langOrder += 1;
        }
      }

      // Habilidades técnicas
      let techOrder = 0;
      for (const tSlug of seed.technologies || []) {
        const tId = techMap.get(tSlug);
        if (tId) {
          await client.query(
            "INSERT INTO graduate_technologies (graduate_id, technology_id, proficiency, display_order) VALUES ($1, $2, 4, $3) ON CONFLICT DO NOTHING",
            [graduateId, tId, techOrder]
          );
          techOrder += 1;
        }
      }

      // Habilidades personales
      let softOrder = 0;
      for (const sSlug of seed.softSkills || []) {
        const sId = softMap.get(sSlug);
        if (sId) {
          await client.query(
            "INSERT INTO graduate_soft_skills (graduate_id, soft_skill_id, display_order) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
            [graduateId, sId, softOrder]
          );
          softOrder += 1;
        }
      }

      // Certificados
      let certOrder = 0;
      for (const cert of seed.certificates || []) {
        await client.query(
          `INSERT INTO certificates (graduate_id, title, formation_type, issuer, issue_date, display_order)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [graduateId, cert.title, cert.formationType, cert.issuer, cert.issueDate, certOrder]
        );
        certOrder += 1;
      }

      // Experiencias
      let expOrder = 0;
      for (const exp of seed.experiences || []) {
        await client.query(
          `INSERT INTO experiences (graduate_id, position, organization, category, start_date, end_date, date_format, is_current, description, display_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            graduateId,
            exp.position,
            exp.organization,
            exp.category || "work",
            exp.startDate,
            exp.endDate,
            exp.dateFormat || "month",
            exp.isCurrent,
            exp.description,
            expOrder,
          ]
        );
        expOrder += 1;
      }

      // Proyectos
      let projOrder = 0;
      for (const proj of seed.projects || []) {
        await client.query(
          `INSERT INTO projects (graduate_id, title, description, url, display_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [graduateId, proj.title, proj.description, proj.url, projOrder]
        );
        projOrder += 1;
      }

      // Recomendaciones
      for (const rec of seed.recommendations || []) {
        await client.query(
          `INSERT INTO recommendations (graduate_id, author_name, author_role, message, status)
           VALUES ($1, $2, $3, $4, 'published')`,
          [graduateId, rec.authorName, rec.authorRole, rec.message]
        );
      }

      console.log(`[CREADO] ${seed.code} — ${seed.firstName} ${seed.lastName} (${seed.currentRole})`);
      insertedCount += 1;
    }

    await client.query("COMMIT");
    console.log(`\nProceso finalizado con éxito:`);
    console.log(`- Nuevos perfiles insertados: ${insertedCount}`);
    console.log(`- Perfiles omitidos (ya existían): ${skippedCount}`);
    console.log(`- Clave de acceso para los nuevos usuarios: ${demoPassword}`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error durante la inserción de semillas:", err);
    throw err;
  } finally {
    client.release();
  }
}

if (process.argv[1] && process.argv[1].endsWith("seed_more_profiles.js")) {
  seedMoreProfiles()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}

export { seedMoreProfiles };
