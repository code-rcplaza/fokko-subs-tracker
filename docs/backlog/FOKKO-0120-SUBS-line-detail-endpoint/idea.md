# FOKKO-0120-SUBS · `GET /api/subscriptions/line`: el detalle de una línea

## Problema
Detalle (FOKKO-0106A-SUBS) muestra el ciclo, los últimos cobros y el alza de una suscripción. El back
ya lo arma (`BuildLineDetail`, FOKKO-0039-SUBS), pero ningún caso de uso ni ruta lo expone.

## Depende de
- FOKKO-0039-SUBS, FOKKO-0072A-SUBS y FOKKO-0029-SUBS.

## Alcance
- Caso de uso `GetLineDetail`: lee el resumen (12 meses) y toma la línea de las suscripciones.
- `GET /api/subscriptions/line?lineKey=`: la línea como en el resumen, `cycle {day, month}`, los
  últimos 6 cobros (más reciente primero, con su equivalente en pesos) y `rise` o `null`.

## Fuera
- Detalle de una posible: no tiene hasta que se decide (404).

## Features afectadas
- `internal/subscriptions` (`domain`, `usecases`, `adapters/http`) y `cmd/api` (cableado).

## Dudas resueltas
- Salió al hacer FOKKO-0106A-SUBS. Manda lo que ya está: el detalle vive en el back.
- El alza sale del resumen (no se recalcula), así un alza "mantenida" tampoco aparece en Detalle.
- Clave sin línea, o de una posible: 404 `subscriptions.line_not_found`; sin clave: 400 `lineKey`.

## Tareas
- [x] [TASK-001 Cobro en pesos](TASK-001-CHARGE-IN-PESOS.md)
- [x] [TASK-002 Caso de uso del detalle](TASK-002-GET-LINE-DETAIL.md)
- [x] [TASK-003 Ruta del detalle](TASK-003-ROUTE-LINE-DETAIL.md)
