# FOKKO-0111-SUBS · Eliminar todo

## Problema
Eliminar todo borra la cuenta y los datos, con la opción de descargar una copia antes.

## Depende de
- FOKKO-0079-SUBS, FOKKO-0080-SUBS y FOKKO-0110A-SUBS y FOKKO-0110B-SUBS.
- FOKKO-0085C-SUBS y FOKKO-0085D-SUBS.

## Alcance
- `DeleteAllConfirm`, descarga de la copia y `useDeleteAll`.

## Fuera
- Nada.

## Capas
clean architecture por feature (`features/profile/{domain,application,infrastructure,presentation}`); los componentes son presentacionales y el contenedor de `screens` los conecta con los hooks.

## Features afectadas
- `frontend` (`features/profile`)

## Dudas resueltas
- `/perfil/eliminar`, desde "Tus datos" de Perfil (el handoff lo colgaba de Fuentes, post-MVP).
- La copia se baja con `getFile` de `lib/api` (blob y nombre de `Content-Disposition`) y `saveFile`
  de `lib/files`, para poder avisar si falla; un fallo no bloquea eliminar.
- Lo que se borra se lista según la base (cuenta, suscripciones con cobros y decisiones, registro de
  cartolas); sin la dirección del buzón del handoff (post-MVP).
- Confirmación con `ConfirmDialog`; tras el 204, `queryClient.clear()` y a `/registro`.

## Tareas
- [x] [TASK-001 Descargar la copia](TASK-001-EXPORT-DOWNLOAD.md)
- [x] [TASK-002 Confirmación](TASK-002-DELETE-ALL-CONFIRM.md)
- [x] [TASK-003A Llamar a `DELETE /api/me`](TASK-003A-DELETE-CALL.md)
- [x] [TASK-003B Salir tras eliminar](TASK-003B-DELETE-SUCCESS.md)
- [x] [TASK-003C Error al eliminar](TASK-003C-DELETE-FAILURE.md)
- [x] [TASK-004 Exportar por HTTP](TASK-004-GATEWAY-EXPORT.md)
- [x] [TASK-005 Eliminar todo por HTTP](TASK-005-GATEWAY-DELETE-ALL.md)
- [x] [TASK-006 Conectar el hook con los componentes](TASK-006-CONTAINER-DELETE-ALL.md)
