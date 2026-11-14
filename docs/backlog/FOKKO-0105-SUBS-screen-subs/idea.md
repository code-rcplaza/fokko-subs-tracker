# FOKKO-0105-SUBS · Subs

## Problema
Subs lista todas las suscripciones del usuario, con su monto, próximo cobro y marcas.

## Depende de
- FOKKO-0072A-SUBS a FOKKO-0072H-SUBS y FOKKO-0088-SUBS.
- FOKKO-0085C-SUBS y FOKKO-0085D-SUBS.

## Alcance
- `SubscriptionList` y `SubscriptionRow`.

## Fuera
- Nada.

## Capas
clean architecture por feature (`features/subscriptions/{domain,application,infrastructure,presentation}`); los componentes son presentacionales y el contenedor de `screens` los conecta con los hooks.

## Features afectadas
- `frontend` (`features/subscriptions`)

## Dudas resueltas
- Leer por HTTP (TASK-005) no necesita un endpoint nuevo: Subs usa `readSummary` y la misma clave que
  Resumen (`select` toma las líneas y el total), una sola petición y una sola caché.
- El esquema de la línea ganó `inPesos`, `nextCharge`, `bank`, `card` y `markedForCancellationAt`; el
  test del esquema de 0103 se ajustó (cambió el requisito), y sigue dejando fuera `cardLast4`.
- Agregar va a `/subs/agregar` (pantalla de FOKKO-0107A-SUBS). "Agregar" y "Subir cartola" pasaron a
  llaves compartidas (`ui.add`, `ui.upload_statement`).
- Fila: "mié 18 nov · BCI · crédito" (una manual no tiene banco ni tarjeta); en dólares,
  "USD 20 · ≈ $19.000", o solo "USD 20" sin tipo de cambio.

## Tareas
- [x] [TASK-001 `SubscriptionList`](TASK-001-SUBSCRIPTION-LIST.md)
- [x] [TASK-002A Datos básicos de la fila](TASK-002A-ROW-BASIC.md)
- [x] [TASK-002B Monto en dólares](TASK-002B-ROW-USD.md)
- [x] [TASK-002C Marcas de la fila](TASK-002C-ROW-BADGES.md)
- [x] [TASK-003 Subs vacío](TASK-003-SUBS-EMPTY.md)
- [x] [TASK-004 Leer las suscripciones](TASK-004-HOOK-SUBSCRIPTIONS.md)
- [x] [TASK-005 Leer las suscripciones por HTTP](TASK-005-GATEWAY-SUBSCRIPTIONS.md)
- [x] [TASK-006 Conectar el hook con los componentes](TASK-006-CONTAINER-SUBS.md)
