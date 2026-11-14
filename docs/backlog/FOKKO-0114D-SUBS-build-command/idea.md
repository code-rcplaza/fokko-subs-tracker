# FOKKO-0114D-SUBS · Comando de build único

## Problema
Hoy el front y el back se construyen por separado. El destino es un solo binario de Go que sirve la API y el front ya compilado, para desplegar un solo contenedor.

Esta idea cubre solo: Comando de build único. El resto del trabajo original está en las ideas hermanas `FOKKO-0114*-SUBS`.

## Depende de
- FOKKO-0083A-SUBS a FOKKO-0083C-SUBS y FOKKO-0082A-SUBS a FOKKO-0082D-SUBS.

## Alcance
- Un solo comando de build

## Fuera
- Imagen de Docker → FOKKO-0115-SUBS.

## Features afectadas
- `internal/shared` (`httpserver/web`)
- `frontend` (build)

## Dudas abiertas
- Falta agregar `make build` a "Comandos" de `CLAUDE.md` (criterio 3): editar `CLAUDE.md` se pregunta antes.

## Dudas resueltas
- `Makefile` en la raíz: `make build` corre `pnpm install --frozen-lockfile && pnpm build` (al embed)
  y después `go build -o backend/bin/mail-checker ./cmd/api`; `make` se detiene en la primera falla.
- El reemplazo versionado del embed: ver FOKKO-0114A-SUBS.

## Tareas
- [x] [TASK-001 Un solo comando de build](TASK-001-BUILD-COMMAND.md)
