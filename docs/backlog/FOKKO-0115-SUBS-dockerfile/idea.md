# FOKKO-0115-SUBS · Dockerfile multi-stage

## Problema
El despliegue queda independiente de la plataforma si todo vive en una imagen de Docker: una sola imagen, configuración solo por variables de entorno y SQLite en un volumen.

## Depende de
- FOKKO-0114A-SUBS a FOKKO-0114D-SUBS y FOKKO-0081-SUBS.

## Alcance
- Dockerfile multi-stage (front, back, imagen final mínima), usuario sin privilegios, volumen para los datos y chequeo de salud.

## Fuera
- Elegir proveedor de alojamiento: sigue abierto (decisión 20).

## Features afectadas
- `.` (raíz del repo)

## Dudas abiertas
- SQLite exige una sola réplica y un volumen persistente: es el único requisito sobre la plataforma.

## Dudas resueltas
- Base `gcr.io/distroless/static-debian12:nonroot` y subcomando `mail-checker health` (opción
  propuesta): `HEALTHCHECK` lo usa porque la imagen no trae shell ni `curl`.
- La app escuchaba fijo en `127.0.0.1` (pensada local): dentro de un contenedor no se alcanza. Nueva
  variable `MAILCHECKER_HOST` (IP; por defecto `127.0.0.1`, la imagen pone `0.0.0.0`). Los dos tests de
  `LoadConfig` que comparan el `Config` entero ganaron el campo `Host` (cambió el requisito).
- Verificado con Docker 29: health 200 desde el host, `docker inspect` healthy, usuario `nonroot`, front y
  caché de `assets/`, la cuenta sigue al recrear el contenedor con el volumen `/data`, y la imagen
  (27 MB) solo tiene `app/mail-checker` y `data/`. `.dockerignore` deja fuera `.git`, `.env*`, datos y builds.

## Tareas
- [x] [TASK-001 Dockerfile multi-stage](TASK-001-DOCKERFILE-BUILD.md)
- [x] [TASK-002A Proceso sin privilegios](TASK-002A-RUNTIME-NONROOT.md)
- [x] [TASK-002B Datos en volumen](TASK-002B-RUNTIME-VOLUME.md)
- [x] [TASK-002C Configuración por entorno](TASK-002C-RUNTIME-ENV.md)
- [x] [TASK-003 Chequeo de salud](TASK-003-CONTAINER-HEALTHCHECK.md)
- [x] [TASK-004 `.dockerignore`](TASK-004-DOCKERIGNORE.md)
