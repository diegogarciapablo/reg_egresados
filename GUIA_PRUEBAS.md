# Guia rapida: levantar y probar el backend

Esta guia asume que ya tienes **Docker Desktop** instalado y corriendo.
No necesitas Node.js instalado en tu maquina; todo corre dentro de contenedores.

## 1. Preparar el entorno

```bash
cp .env.example .env
```

No hace falta editar nada si vas a usar el modo autocontenido (paso 2).

## 2. Levantar los contenedores

Este proyecto trae dos formas de levantarse:

- **`docker-compose.standalone.yml`**: incluye Postgres + pgAdmin + backend, todo
  autocontenido. Usa este si es la primera vez que corres el proyecto o si no
  tienes un Postgres compartido con otros proyectos.

  ```bash
  docker compose -f docker-compose.standalone.yml up --build -d
  ```

- **`docker-compose.yml`**: solo levanta el backend (`app`), reutilizando un
  Postgres+pgAdmin externo ya existente en la red Docker `red_externa`. Usa
  este si ya tienes esa infraestructura compartida corriendo (ver seccion 6).

  ```bash
  docker compose up --build -d
  ```

## 3. Verificar que los contenedores estan arriba

```bash
docker ps
```

Deberias ver `egresados_app` (y `egresados_db` / `egresados_pgadmin` si usaste
el modo standalone) en estado `Up`.

## 4. Datos de prueba

Al iniciar, el contenedor aplica las migraciones pendientes y carga datos de
prueba si las tablas funcionales estan vacias: 10 usuarios y 6 registros por
tabla relacionada. Si encuentra al menos un registro funcional, omite toda la
carga. La base usa un volumen Docker, por lo que los datos sobreviven al
reinicio o recreacion del contenedor.

Para iniciar sesion con el usuario **administrador**:

```
Correo: admin@example.test
Clave: Prueba123!
```

Para iniciar sesion con cualquiera de los usuarios semilla (**usuario estandar**):

```
Correo: ana.mendez@example.test
Clave: Prueba123!
```

Todos los usuarios semilla comparten esa clave. Si eliminas la base con
`docker compose down -v`, el siguiente `up` vuelve a crear el esquema y los
datos de prueba automaticamente.

## 5. Revisar logs (opcional)

```bash
docker compose logs -f app
```

Deberias ver: `Servidor escuchando en http://localhost:3000`
(Ctrl+C para salir de los logs; no detiene el contenedor).

## 6. Probar los endpoints

### Health check
```bash
curl http://localhost:3000/api/health
```
Respuesta esperada: `{"status":"ok"}`

### Registrar un usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"prueba@test.com\",\"password\":\"12345678\",\"firstName\":\"Ana\",\"lastName\":\"Gomez\",\"graduationYear\":2023}"
```
Respuesta esperada: un objeto con `user` y `graduate`.

### Iniciar sesion
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"prueba@test.com\",\"password\":\"12345678\"}" \
  -c cookies.txt
```
El flag `-c cookies.txt` guarda la cookie de sesion para usarla en las
siguientes peticiones autenticadas.

### Ver el directorio publico
```bash
curl http://localhost:3000/api/graduates
```
Respuesta esperada: una lista con los perfiles semilla publicos.

### Ver el catalogo de tecnologias
```bash
curl http://localhost:3000/api/catalogs/technologies
```

### Ver el perfil propio (autenticado)
```bash
curl http://localhost:3000/api/me/profile -b cookies.txt
```

### Cambiar la visibilidad del perfil a publico
```bash
curl -X PATCH http://localhost:3000/api/me/profile/visibility \
  -H "Content-Type: application/json" \
  -d "{\"visibility\":\"public\"}" \
  -b cookies.txt
```
Despues de esto, `GET /api/graduates` deberia mostrar la ficha en el
directorio.

> **Tip:** si estos comandos `curl` con comillas escapadas dan problemas en
> tu terminal, usa Postman o la extension Thunder Client de VS Code — mismas
> peticiones, interfaz visual.

## 7. Consultar la base de datos con pgAdmin

Entra a `http://localhost:5050` (modo standalone) o `http://localhost:5051`
(si usaste el pgAdmin externo compartido). Conecta con las credenciales de
tu `.env` y explora las tablas de `egresados_db`.

## 8. Aplicar cambios en el codigo

Como el codigo se copia dentro de la imagen al hacer `docker build`, cada
vez que edites un archivo `.js` o `.sql` necesitas reconstruir para que el
cambio se refleje. La inicializacion vuelve a omitir las semillas si ya hay
datos:

```bash
docker compose up --build -d
```

## 9. Reiniciar todo desde cero (si algo queda en mal estado)

```bash
docker compose down -v
docker compose -f docker-compose.standalone.yml up --build -d
docker exec -it egresados_app npm run migrate
```

`down -v` tambien borra el volumen de datos de Postgres, asi que pierdes
los datos de prueba — perfecto para un ambiente de practica.
