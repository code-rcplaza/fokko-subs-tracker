# FOKKO-0117-SUBS · README

## Problema
El repositorio es público y no tiene un README que explique qué es la app, cómo correrla y cómo desplegarla.

## Depende de
- FOKKO-0116-SUBS.

## Alcance
- `README.md` en la raíz, en español, sin datos personales ni cartolas.

## Fuera
- Documentación de diseño: vive en `docs/ARCHITECTURE.md`.

## Features afectadas
- `.` (raíz del repo)

## Dudas resueltas
- El README ya existía; se actualizó: estado MVP, `docker compose up --build` como camino corto y
  `make build` sin Docker, tabla de variables con columna "Obligatoria" (suma `MAILCHECKER_HOST` y
  `FOKKO_HOST_PORT`), sección de despliegue (una réplica y volumen, `mail-checker health`, respaldo
  del volumen), datos guardados y descartados según la base y las pruebas de privacidad, y enlace a
  "Agregar un banco".
- Comprobado en una copia limpia (solo archivos que versiona git): `docker compose up --build` queda
  healthy, sirve el front y el respaldo con `tar` funciona; `go build` compila sin el front construido.

## Tareas
- [x] [TASK-001A Qué detecta la app](TASK-001A-README-WHAT.md)
- [x] [TASK-001B Enlaces a la documentación](TASK-001B-README-LINKS.md)
- [x] [TASK-001C Qué datos se guardan](TASK-001C-README-DATA.md)
- [x] [TASK-002 Correr en desarrollo](TASK-002-README-RUN-DEV.md)
- [x] [TASK-003A Tabla de variables](TASK-003A-README-ENV.md)
- [x] [TASK-003B Requisito de SQLite](TASK-003B-README-SQLITE.md)
- [x] [TASK-003C Chequeo de salud](TASK-003C-README-HEALTH.md)
