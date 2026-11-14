# FOKKO-0101-SUBS · Error de lectura

## Problema
Error muestra por qué falló la subida y cómo seguir. Es el 400 de `POST /api/statements` con su llave i18n.

## Depende de
- FOKKO-0070-SUBS y FOKKO-0099-SUBS.
- FOKKO-0085C-SUBS y FOKKO-0085D-SUBS.

## Alcance
- Pantalla de error con mensaje por llave y reintento.

## Fuera
- Nada.

## Capas
clean architecture por feature (`features/statements/{domain,application,infrastructure,presentation}`); los componentes son presentacionales y el contenedor de `screens` los conecta con los hooks.

## Features afectadas
- `frontend` (`features/statements`)

## Dudas abiertas
- Resuelta: Error es el tercer estado de `/fuente` (con el formulario y Cargando). El título sale
  del tipo de falla (`failureKindOf`: banco, cartola repetida, archivo, no se pudo leer) y el
  mensaje de la llave; una llave desconocida usa el genérico. "Elegir el banco" conserva el archivo;
  "Elegir otro archivo" lo vacía. `statements.billing_date_required` no va a Error: se corrige en
  el mismo formulario.
- Resuelta: sin "Reenviar correos de cobro" ni "contáctanos desde Fuentes" (post-MVP).

## Tareas
- [x] [TASK-001 Pantalla de error](TASK-001-UPLOAD-ERROR-SCREEN.md)
- [x] [TASK-002A Mensajes de banco o cartola repetida](TASK-002A-ERRMSG-BANK-IMPORTED.md)
- [x] [TASK-002B Mensajes de archivo](TASK-002B-ERRMSG-FILE.md)
- [x] [TASK-002C Mensaje genérico](TASK-002C-ERRMSG-UNKNOWN.md)
- [x] [TASK-003 Conectar el hook con los componentes](TASK-003-CONTAINER-UPLOAD-ERROR.md)
