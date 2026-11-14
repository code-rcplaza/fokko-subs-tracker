# FOKKO-0120-SUBS/TASK-003 · Ruta del detalle
Feature: `backend/internal/subscriptions/adapters/http`

## Criterios
- Dada una suscripción, cuando se pide `GET /api/subscriptions/line?lineKey=`, entonces responde 200 con la línea, `cycle`, `charges` y `rise`.
- Dada una clave sin línea, entonces 404; sin clave, 400 con `fields.lineKey`.

## Fuera
- Nada.
