# FOKKO-0113B-SUBS · Pruebas de privacidad

## Problema
El registro exige aceptar términos y política de privacidad, y la pantalla Análisis promete "solo guardamos servicio, monto y fecha". Esa promesa solo vale si el proceso realmente descarta el resto. Decisión abierta 12 de `docs/mvp.md`.

Esta idea cubre solo: Pruebas de privacidad. El resto del trabajo original está en las ideas hermanas `FOKKO-0113*-SUBS`.

## Depende de
- FOKKO-0094-SUBS y FOKKO-0070-SUBS.

## Alcance
- No se guarda el texto de la cartola
- Los logs no filtran datos

## Fuera
- Asesoría legal: los textos los define y revisa el usuario.

## Features afectadas
- `frontend` (`features/auth`, páginas legales)
- `internal/statements` (pruebas)

## Dudas abiertas
- ⛔ Decisión 12: los textos legales no se inventan. Se necesitan el texto de los términos y de la política, y qué dato se conserva y por cuánto tiempo (nombre y correo del usuario; servicio, monto y fecha de cada cobro).

## Dudas resueltas
- Las pruebas no dependen de los textos legales (eso es FOKKO-0113A-SUBS, que sigue ⛔).
- `cmd/api/smoke_privacy_test.go`, con la app real: una cartola con una compra ilegible marcada y el
  nombre del titular; ni la marca, ni el titular, ni el lugar, ni las líneas que no son cobros quedan en
  ninguna tabla (con control positivo: el escaneo sí ve el correo guardado). `charges` tiene solo
  descriptor, monto, fecha, tarjeta y últimos 4 (más ids y enlaces) y `bad_lines` solo números.
- Logs: las líneas de slog no tienen correo, código, nombres de archivo, descriptores ni montos, en
  registro, subidas, una repetida (409) y un archivo que no es PDF. La línea del código que imprime el
  modo consola no es log y se excluye a propósito.
- La llave de Resend no se prueba aquí: las pruebas de humo corren en modo consola, sin llave.

## Tareas
- [x] [TASK-001 No se guarda el texto de la cartola](TASK-001-PRIVACY-NO-RAW-TEXT.md)
- [x] [TASK-002 Los logs no filtran datos](TASK-002-PRIVACY-LOGS.md)
