# FOKKO-0119-SUBS/TASK-001 · Reparto en la respuesta del resumen
Feature: `backend/internal/subscriptions/adapters/http`

Como usuario quiero ver qué servicio pesa más en el anillo, para decidir dónde recortar.

## Criterios
- Dado un resumen con dos líneas en pesos, cuando se codifica, entonces `spend` las trae de mayor a menor con nombre, monto y porcentaje.
- Dados siete servicios, cuando se codifica, entonces trae los cinco mayores y un "Otros" sin nombre.
- Dado un resumen vacío, cuando se codifica, entonces `spend` es `[]`.

## Fuera
- Nada.

## Notas
- Mapper en `summary_response.go`; el cálculo es `domain.TopSpendShares(domain.SpendByService(...))`.
