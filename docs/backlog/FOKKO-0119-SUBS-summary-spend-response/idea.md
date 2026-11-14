# FOKKO-0119-SUBS · El reparto por servicio en `GET /api/summary`

## Problema
El anillo del Resumen muestra el gasto por servicio, y el back ya lo calcula (`SpendByService` y
`TopSpendShares`, FOKKO-0036-SUBS), pero la respuesta del resumen no lo trae. Sin esto, el front
tendría que repetir la regla (cadencia, pesos, cinco mayores más "Otros").

## Depende de
- FOKKO-0036-SUBS y FOKKO-0072A-SUBS.

## Alcance
- `spend` en la respuesta de `GET /api/summary`: `[{name, amount, percent, isOthers}]`, monto
  mensual en pesos (centésimas), los cinco mayores y "Otros".

## Fuera
- Cambiar el cálculo: es el de FOKKO-0036-SUBS.

## Features afectadas
- `internal/subscriptions` (`adapters/http`)

## Dudas resueltas
- Salió al hacer FOKKO-0103-SUBS (Resumen). Manda lo que ya está: el reparto vive en el back.
- Nombre: el del servicio; una línea manual no tiene, así que va su alias. "Otros" va sin nombre
  (`isOthers`) y el front lo escribe con i18n.

## Tareas
- [x] [TASK-001 Reparto en la respuesta del resumen](TASK-001-SPEND-IN-SUMMARY-RESPONSE.md)
