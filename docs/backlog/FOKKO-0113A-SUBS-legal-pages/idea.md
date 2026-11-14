# FOKKO-0113A-SUBS · Textos legales (Próximamente)

## Problema
El registro exige aceptar términos y política de privacidad, y la pantalla Análisis promete "solo guardamos servicio, monto y fecha". Esa promesa solo vale si el proceso realmente descarta el resto. Decisión abierta 12 de `docs/mvp.md`.

Esta idea cubre solo: Textos legales ⛔ decisión 12. El resto del trabajo original está en las ideas hermanas `FOKKO-0113*-SUBS`.

## Depende de
- FOKKO-0094-SUBS y FOKKO-0070-SUBS.

## Alcance
- Páginas de términos y privacidad

## Fuera
- Asesoría legal: los textos los define y revisa el usuario.

## Features afectadas
- `frontend` (`features/auth`, páginas legales)
- `internal/statements` (pruebas)

## Dudas abiertas
- Decisión 12: los textos los está escribiendo el usuario. Cuando lleguen, se reemplaza "Próximamente"
  en `LegalPage` y se revisa que la privacidad coincida con lo que guarda la app (TASK-001C).

## Dudas resueltas
- El usuario pidió cerrarla con un "Próximamente" (2026-11-14): `/terminos` y `/privacidad` abren sin
  sesión (fuera de las guardas) y dicen que el texto viene; Registro enlaza a las dos bajo la casilla.

## Tareas
- [x] [TASK-001A Abrir las páginas legales](TASK-001A-LEGAL-PAGES-OPEN.md)
- [x] [TASK-001B Enlace desde Registro](TASK-001B-LEGAL-LINK.md)
- [x] [TASK-001C Texto coherente con lo que guarda la app](TASK-001C-LEGAL-TEXT-MATCH.md)
