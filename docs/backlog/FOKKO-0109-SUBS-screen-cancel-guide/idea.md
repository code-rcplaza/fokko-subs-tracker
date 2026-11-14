# FOKKO-0109-SUBS · Cómo cancelar

## Problema
Cómo cancelar da el enlace al sitio del servicio y tres pasos de texto fijo; el usuario marca "por cancelar" a mano (la app no cancela nada).

## Depende de
- FOKKO-0077A-SUBS y FOKKO-0077B-SUBS y FOKKO-0108-SUBS.
- FOKKO-0085C-SUBS y FOKKO-0085D-SUBS.

## Alcance
- `CancelSteps`, el enlace seguro y `CancellationStatus`.

## Fuera
- Reenviar el correo de cancelación: post-MVP.

## Capas
clean architecture por feature (`features/subscriptions/{domain,application,infrastructure,presentation}`); los componentes son presentacionales y el contenedor de `screens` los conecta con los hooks.

## Features afectadas
- `frontend` (`features/subscriptions`)

## Dudas resueltas
- Un solo botón, "La voy a cancelar" (el back guarda una sola marca; "Ya la cancelé" haría lo mismo).
- Fuera del handoff por ser post-MVP: reenviar el correo de cancelación al buzón y la proyección del
  gasto. La línea sigue sumando mientras lleguen cobros (ARCHITECTURE).
- El enlace solo abre si es `https` (`safeCancelUrlOf`), en otra pestaña con `noopener noreferrer`.
- Volver lleva a Detalle de la línea (Cómo cancelar se abre desde Detalle y desde Alerta).

## Tareas
- [x] [TASK-001 `CancelSteps`](TASK-001-CANCEL-STEPS.md)
- [x] [TASK-002 Enlace al sitio del servicio](TASK-002-CANCEL-LINK.md)
- [x] [TASK-003 Marcar "por cancelar"](TASK-003-MARK-CANCELLATION.md)
- [x] [TASK-004 Marcar por cancelar por HTTP](TASK-004-GATEWAY-MARK-CANCEL.md)
- [x] [TASK-005 Conectar el hook con los componentes](TASK-005-CONTAINER-CANCEL.md)
