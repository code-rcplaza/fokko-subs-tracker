# FOKKO-0106A-SUBS · Detalle de una línea (con o sin alza)

## Problema
Detalle muestra una suscripción: ciclo, últimos cobros y el bloque de alza; desde ahí se edita, se cancela o se deja de seguir. El handoff solo diseñó el caso con alza.

Esta idea cubre solo: Detalle de una línea (con o sin alza). El resto del trabajo original está en las ideas hermanas `FOKKO-0106*-SUBS`.

## Depende de
- FOKKO-0039-SUBS, FOKKO-0072A-SUBS a FOKKO-0072H-SUBS y FOKKO-0078-SUBS.
- FOKKO-0085C-SUBS y FOKKO-0085D-SUBS.

## Alcance
- Encabezado y ciclo
- `PriceChangeBlock`
- `ChargeHistory`

## Fuera
- Nada.

## Capas
clean architecture por feature (`features/subscriptions/{domain,application,infrastructure,presentation}`); los componentes son presentacionales y el contenedor de `screens` los conecta con los hooks.

## Features afectadas
- `frontend` (`features/subscriptions`)

## Dudas abiertas
- La confirmación de "dejar de seguir" es un diálogo: hay que cuidar foco, Esc y bloqueo de scroll a mano. Si resulta frágil se propone Radix Primitives como dependencia (FOKKO-0106B-SUBS).

## Dudas resueltas
- Detalle sin alza: el mismo Detalle sin el bloque de alza (la opción propuesta).
- El back no exponía el detalle: se agregó `GET /api/subscriptions/line` en FOKKO-0120-SUBS.
- "10 % de tu gasto mensual" del handoff queda fuera: el reparto va por servicio, no por línea.
- "Editar" lleva a `/subs/<lineKey>/editar` (FOKKO-0107B-SUBS) y "Ver cómo cancelar" a
  `/subs/<lineKey>/cancelar` (FOKKO-0109-SUBS); "Dejar de seguir" llega con FOKKO-0106B-SUBS.
- "Próximo cobro" pasó a una llave compartida (`ui.next_charge`).

## Tareas
- [x] [TASK-001A Ciclo mensual](TASK-001A-DETAIL-MONTHLY.md)
- [x] [TASK-001B Ciclo anual](TASK-001B-DETAIL-YEARLY.md)
- [x] [TASK-001C Alias en el encabezado](TASK-001C-DETAIL-ALIAS.md)
- [x] [TASK-002 `PriceChangeBlock`](TASK-002-PRICE-CHANGE-BLOCK.md)
- [x] [TASK-003 `ChargeHistory`](TASK-003-CHARGE-HISTORY.md)
- [x] [TASK-004 Leer el detalle de una línea](TASK-004-HOOK-LINE-DETAIL.md)
- [x] [TASK-005 Leer el detalle por HTTP](TASK-005-GATEWAY-LINE-DETAIL.md)
- [x] [TASK-006 Conectar el hook con los componentes](TASK-006-CONTAINER-DETAIL.md)
