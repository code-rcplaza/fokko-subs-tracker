# FOKKO-0107B-SUBS · Editar una suscripción

## Problema
Editar permite nombrar una línea y corregir su monto y día; Agregar crea una suscripción manual. Un solo `SubscriptionForm` con su esquema zod.

Esta idea cubre solo: Editar una suscripción. El resto del trabajo original está en las ideas hermanas `FOKKO-0107*-SUBS`.

## Depende de
- FOKKO-0074A-SUBS y FOKKO-0074B-SUBS, FOKKO-0075-SUBS y FOKKO-0087-SUBS.
- FOKKO-0085C-SUBS y FOKKO-0085D-SUBS.

## Alcance
- Editar una línea detectada
- Editar o quitar una manual

## Fuera
- Nada.

## Capas
clean architecture por feature (`features/subscriptions/{domain,application,infrastructure,presentation}`); los componentes son presentacionales y el contenedor de `screens` los conecta con los hooks.

## Features afectadas
- `frontend` (`features/subscriptions`)

## Dudas resueltas
- Sin categoría; CLP o USD solo en las manuales (una línea detectada mantiene su moneda).
- Línea detectada: alias (vacío lo borra) y override; solo se envía lo que cambió, y el override va
  con monto y día juntos para que uno no deshaga el otro.
- Desde Revisión (`/subs/<lineKey>/editar?desde=revision`) la línea aún es posible y no tiene
  Detalle: se toma de la lista de posibles y al guardar vuelve a `/revision`. La tarjeta de Revisión
  ganó el enlace "Editar nombre o monto".
- Manual (`manual:<publicId>`): el mismo formulario de Agregar (`useManualForm`, compartido) con PUT,
  y "Quitar" con `ConfirmDialog` y DELETE; luego vuelve a Subs.
- La ruta de Detalle pasó a `subs/$lineKey/index.tsx` para que Editar no quede anidada en ella.

## Tareas
- [x] [TASK-001 Editar una línea detectada](TASK-001-EDIT-LINE-FORM.md)
- [x] [TASK-002 Editar o quitar una manual](TASK-002-EDIT-MANUAL-FORM.md)
- [x] [TASK-003 Editar por HTTP](TASK-003-GATEWAY-EDIT.md)
- [x] [TASK-004 Conectar el hook con los componentes](TASK-004-CONTAINER-EDIT.md)
