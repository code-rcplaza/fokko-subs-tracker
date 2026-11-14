# FOKKO-0102-SUBS · Revisión (con selector de cadencia)

## Problema
Revisión pide al usuario decidir sobre cada "posible": es una suscripción (con cadencia) o no lo es. Se puede deshacer.

## Depende de
- FOKKO-0073A-SUBS y FOKKO-0073B-SUBS, FOKKO-0089A-SUBS y FOKKO-0089B-SUBS y FOKKO-0090-SUBS.
- FOKKO-0085C-SUBS y FOKKO-0085D-SUBS.

## Alcance
- `ReviewCard`, `ReviewProgressRing` y los hooks de decisión.

## Fuera
- Nada.

## Capas
clean architecture por feature (`features/subscriptions/{domain,application,infrastructure,presentation}`); los componentes son presentacionales y el contenedor de `screens` los conecta con los hooks.

## Features afectadas
- `frontend` (`features/subscriptions`)

## Dudas resueltas
- El selector de cadencia (mensual o anual) no está en el diseño del handoff: se agrega con
  `SegmentedControl`, sin valor por defecto, después de tocar "Sí" ("Agregar" queda deshabilitado
  hasta elegir).
- Equivalente aproximado de un monto en USD (TASK-001): `GET /api/summary` no lo trae para las
  posibles, así que se muestra el monto original. Si se quiere, va al back como idea aparte.
- "Ver mi resumen" (TASK-004): se usa el texto del handoff, "Ir a mi resumen", también para Revisión
  vacía (un solo texto en el catálogo).
- Quedan fuera por ahora: "Editar nombre o monto" (llega con FOKKO-0107B-SUBS, que crea Editar) y el
  enlace de volver a "Análisis" (Revisión no conoce la cartola y también se abre desde Resumen).
- Las decisiones son estado de la pantalla, no de la caché (ver `ARCHITECTURE.md`, Revisión).

## Tareas
- [x] [TASK-001 Lista de posibles](TASK-001-REVIEW-LIST.md)
- [x] [TASK-002 Confirmar con cadencia](TASK-002-REVIEW-CONFIRM.md)
- [x] [TASK-003A Descartar una posible](TASK-003A-REVIEW-DISMISS.md)
- [x] [TASK-003B Deshacer una decisión](TASK-003B-REVIEW-UNDO.md)
- [x] [TASK-004 Progreso de la revisión](TASK-004-REVIEW-PROGRESS.md)
- [x] [TASK-005 Leer las pendientes de revisión](TASK-005-HOOK-REVIEW-LIST.md)
- [x] [TASK-006 Leer las pendientes por HTTP](TASK-006-GATEWAY-REVIEW-READ.md)
- [x] [TASK-007 Enviar una decisión por HTTP](TASK-007-GATEWAY-REVIEW-DECIDE.md)
- [x] [TASK-008 Conectar el hook con los componentes](TASK-008-CONTAINER-REVIEW.md)
