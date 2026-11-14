# FOKKO-0106B-SUBS · Dejar de seguir

## Problema
Detalle muestra una suscripción: ciclo, últimos cobros y el bloque de alza; desde ahí se edita, se cancela o se deja de seguir. El handoff solo diseñó el caso con alza.

Esta idea cubre solo: Dejar de seguir. El resto del trabajo original está en las ideas hermanas `FOKKO-0106*-SUBS`.

## Depende de
- FOKKO-0039-SUBS, FOKKO-0072A-SUBS a FOKKO-0072H-SUBS y FOKKO-0078-SUBS.
- FOKKO-0085C-SUBS y FOKKO-0085D-SUBS.

## Alcance
- Dejar de seguir

## Fuera
- Nada.

## Capas
clean architecture por feature (`features/subscriptions/{domain,application,infrastructure,presentation}`); los componentes son presentacionales y el contenedor de `screens` los conecta con los hooks.

## Features afectadas
- `frontend` (`features/subscriptions`)

## Dudas resueltas
- Detalle sin alza: resuelto en FOKKO-0106A-SUBS.
- Diálogo sin Radix: `<dialog>` nativo con `showModal()` (el navegador atrapa el foco, deja inerte el
  fondo y convierte Esc en `cancel`); el componente cierra al tocar fuera, bloquea el scroll y devuelve
  el foco. jsdom no tiene `showModal`: `src/test/setup.ts` trae un shim que solo abre y cierra.
- `ConfirmDialog` queda como molécula en `components/ui/molecules` (también la usará Eliminar todo).
- Si falla, el diálogo queda abierto con el mensaje; mientras viaja no se cierra.

## Tareas
- [x] [TASK-001A Pedir confirmación](TASK-001A-STOP-CONFIRM.md)
- [x] [TASK-001B Accesibilidad del diálogo](TASK-001B-STOP-DIALOG-A11Y.md)
- [x] [TASK-002 Dejar de seguir por HTTP](TASK-002-GATEWAY-STOP-FOLLOWING.md)
- [x] [TASK-003 Conectar el hook con los componentes](TASK-003-CONTAINER-STOP.md)
