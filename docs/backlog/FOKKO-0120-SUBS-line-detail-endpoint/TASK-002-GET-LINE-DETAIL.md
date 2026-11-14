# FOKKO-0120-SUBS/TASK-002 · Caso de uso del detalle
Feature: `backend/internal/subscriptions/usecases`

## Criterios
- Dada una suscripción, cuando se pide su detalle, entonces trae la línea, el ciclo, los cobros y el alza del resumen.
- Dada una posible o una clave desconocida, entonces es `subscriptions.line_not_found`.

## Fuera
- Nada.

## Notas
- Se prueba por la ruta (TASK-003) con la base real, como el resto de las acciones de líneas.
