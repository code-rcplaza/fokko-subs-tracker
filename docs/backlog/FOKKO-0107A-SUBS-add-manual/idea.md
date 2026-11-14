# FOKKO-0107A-SUBS · Agregar una suscripción manual

## Problema
Editar permite nombrar una línea y corregir su monto y día; Agregar crea una suscripción manual. Un solo `SubscriptionForm` con su esquema zod.

Esta idea cubre solo: Agregar una suscripción manual. El resto del trabajo original está en las ideas hermanas `FOKKO-0107*-SUBS`.

## Depende de
- FOKKO-0074A-SUBS y FOKKO-0074B-SUBS, FOKKO-0075-SUBS y FOKKO-0087-SUBS.
- FOKKO-0085C-SUBS y FOKKO-0085D-SUBS.

## Alcance
- Esquema del formulario
- Agregar una manual

## Fuera
- Nada.

## Capas
clean architecture por feature (`features/subscriptions/{domain,application,infrastructure,presentation}`); los componentes son presentacionales y el contenedor de `screens` los conecta con los hooks.

## Features afectadas
- `frontend` (`features/subscriptions`)

## Dudas resueltas
- Sin categoría (YAGNI) y moneda CLP o USD (`SegmentedControl`), como se proponía.
- Monto como se escribe en Chile: "9.990", "9990" o "19,99" (`amountToCents`); "9.99" no es válido
  (punto de miles con dos dígitos).
- Textos del handoff ajustados al MVP: "Para cobros que no aparecen en tu cartola." (no "por correo");
  sin "Si cambia de monto, te avisaremos": una manual no tiene cobros que detecten un alza.
- La revisión visual a 390 y 1280 px (TASK-002) queda con el resto de la revisión visual pendiente.

## Tareas
- [x] [TASK-001A Errores de los campos del formulario](TASK-001A-FORM-FIELDS.md)
- [x] [TASK-001B Tipo con `z.infer`](TASK-001B-FORM-TYPE.md)
- [x] [TASK-002 Agregar una manual](TASK-002-ADD-MANUAL-FORM.md)
- [x] [TASK-003 Crear la manual por HTTP](TASK-003-GATEWAY-ADD-MANUAL.md)
- [x] [TASK-004 Conectar el hook con los componentes](TASK-004-CONTAINER-ADD-MANUAL.md)
