# FOKKO-0116-SUBS · `docker-compose` local

## Problema
Para probar la imagen en el computador (con el volumen y las variables) hace falta un `docker-compose` de desarrollo. No es obligatorio para desplegar.

## Depende de
- FOKKO-0115-SUBS.

## Alcance
- `docker-compose.yml` local y `.env.example` con valores de ejemplo.

## Fuera
- Producción: el despliegue usa la imagen directamente.

## Features afectadas
- `.` (raíz del repo)

## Dudas resueltas
- `docker-compose.yml` usa la misma imagen, un volumen con nombre (`fokko-data:/data`), el chequeo de
  salud de la imagen y un `.env` opcional; `MAILCHECKER_ENV` es `development` si no se dice otra cosa
  (códigos por consola, `docker compose logs`). `FOKKO_HOST_PORT` elige el puerto del host.
- `.env.example` nuevo, con valores claramente falsos y un comentario por variable; `.env` sigue ignorado.
- Probado: `up --build --wait` healthy, health 200, registro con código en consola, y la cuenta sigue
  tras `down` y `up`.

## Tareas
- [x] [TASK-001 `docker-compose.yml`](TASK-001-COMPOSE-FILE.md)
- [x] [TASK-002 `.env.example`](TASK-002-ENV-EXAMPLE.md)
