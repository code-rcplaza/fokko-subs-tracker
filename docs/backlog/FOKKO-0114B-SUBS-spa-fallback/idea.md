# FOKKO-0114B-SUBS · Respaldo de rutas del front

## Problema
Hoy el front y el back se construyen por separado. El destino es un solo binario de Go que sirve la API y el front ya compilado, para desplegar un solo contenedor.

Esta idea cubre solo: Respaldo de rutas del front. El resto del trabajo original está en las ideas hermanas `FOKKO-0114*-SUBS`.

## Depende de
- FOKKO-0083A-SUBS a FOKKO-0083C-SUBS y FOKKO-0082A-SUBS a FOKKO-0082D-SUBS.

## Alcance
- Rutas del front

## Fuera
- Imagen de Docker → FOKKO-0115-SUBS.

## Features afectadas
- `internal/shared` (`httpserver/web`)
- `frontend` (build)

## Dudas resueltas
- Archivo de reemplazo versionado, como se proponía, pero junto a `dist` y no dentro: Vite vacía
  `dist` en cada build. `web/site.go` embebe la carpeta (`//go:embed *`); con `dist/index.html` sirve el
  build y, si no, `web/fallback/index.html`, que avisa que el front no se construyó. `go build`
  compila siempre.
- Un solo handler (`Responder.MountFront`) resuelve 0114A–C: `/api/...` siempre a la API (JSON 404 si
  no existe), un archivo que existe se sirve, una ruta del front sin extensión recibe `index.html`, y
  un archivo que falta (con extensión o bajo `assets/`) es 404 y nunca HTML. Caché: `assets/` con hash
  `public, max-age=31536000, immutable`; el resto `no-cache`; la API `no-store`.

## Tareas
- [x] [TASK-001 Rutas del front](TASK-001-SPA-FALLBACK.md)
