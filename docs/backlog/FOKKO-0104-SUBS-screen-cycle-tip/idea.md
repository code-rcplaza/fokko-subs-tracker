# FOKKO-0104-SUBS · `CycleTip` con el texto corregido

## Problema
El tip "Optimización de ciclo" del Resumen menciona "tu cuenta corriente", lo que contradice "sin acceso a tu banco" (pendiente del handoff).

## Depende de
- FOKKO-0103-SUBS.
- FOKKO-0085C-SUBS y FOKKO-0085D-SUBS.

## Alcance
- `CycleTip` con un texto que no prometa nada que la app no sabe.

## Fuera
- Nada.

## Capas
clean architecture por feature (`features/subscriptions/{domain,application,infrastructure,presentation}`); los componentes son presentacionales y el contenedor de `screens` los conecta con los hooks.

## Features afectadas
- `frontend` (`features/subscriptions`)

## Dudas resueltas
- Texto aprobado por el usuario (2026-11-14): título "Optimización de ciclo sugerida"; "Se te juntan
  cobros el día 20 / los días 5 y 20. Si prefieres repartir el gasto durante el mes, revisa si alguno de
  esos servicios te deja cambiar la fecha de cobro." Habla solo de fechas de cobro.
- Cuándo hay concentración: un día del mes con 3 cobros o más entre los próximos 30 días
  (`minChargesOnOneDay`, en `domain/cycleTip.ts`), contando el día en hora de Santiago.

## Tareas
- [x] [TASK-001 `CycleTip`](TASK-001-CYCLE-TIP.md)
- [x] [TASK-002 Conectar el hook con los componentes](TASK-002-CONTAINER-CYCLE-TIP.md)
