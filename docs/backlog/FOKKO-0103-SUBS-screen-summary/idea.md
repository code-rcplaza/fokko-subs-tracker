# FOKKO-0103-SUBS · Resumen

## Problema
El Resumen es la pantalla principal: total del mes, reparto por servicio, próximo cobro, acciones pendientes y próximos cobros.

## Depende de
- FOKKO-0072A-SUBS a FOKKO-0072H-SUBS, FOKKO-0089A-SUBS y FOKKO-0089B-SUBS y FOKKO-0092-SUBS.
- FOKKO-0085C-SUBS y FOKKO-0085D-SUBS.

## Alcance
- `SpendHero`, `ServiceLegend`, `NextChargeRow`, `PendingActionsList`, `UpcomingChargesList` y la línea de cobros del mes.

## Fuera
- `CycleTip` → FOKKO-0104-SUBS.

## Capas
clean architecture por feature (`features/subscriptions/{domain,application,infrastructure,presentation}`); los componentes son presentacionales y el contenedor de `screens` los conecta con los hooks.

## Features afectadas
- `frontend` (`features/subscriptions`)

## Dudas resueltas
- El reparto por servicio lo calculaba el back pero no salía en `GET /api/summary`: se agregó
  `spend` en FOKKO-0119-SUBS, para no repetir la regla en el front.
- "Subir cartola" (TASK-007) en vez de "Traer mis cobros" del handoff: el MVP es solo cartola.
  "Ver mis fuentes" queda fuera (Fuentes es post-MVP).
- Rutas a las que llevan las filas, aún sin pantalla: Detalle `/subs/<lineKey>` (FOKKO-0106A-SUBS)
  y Alerta `/alerta/<lineKey>` (FOKKO-0108-SUBS). "Ver todos" lleva a `/subs`.
- "Hola, {name}" pasó a una sola llave (`ui.greeting`), compartida con Bienvenida.

## Tareas
- [x] [TASK-001 `SpendHero`](TASK-001-SPEND-HERO.md)
- [x] [TASK-002 `ServiceLegend`](TASK-002-SERVICE-LEGEND.md)
- [x] [TASK-003 Cobros del mes](TASK-003-MONTH-COUNTS.md)
- [x] [TASK-004 `NextChargeRow`](TASK-004-NEXT-CHARGE-ROW.md)
- [x] [TASK-005 `PendingActionsList`](TASK-005-PENDING-ACTIONS-LIST.md)
- [x] [TASK-006 `UpcomingChargesList`](TASK-006-UPCOMING-CHARGES-LIST.md)
- [x] [TASK-007 Resumen vacío](TASK-007-SUMMARY-EMPTY.md)
- [x] [TASK-008 Leer el resumen](TASK-008-HOOK-SUMMARY.md)
- [x] [TASK-009 Leer el resumen por HTTP](TASK-009-GATEWAY-SUMMARY.md)
- [x] [TASK-010 Conectar el hook con los componentes](TASK-010-CONTAINER-SUMMARY.md)
