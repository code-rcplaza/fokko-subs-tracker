# FOKKO-0112B-SUBS · Smoke test: de la cartola al resumen

## Problema
Cada pieza se prueba sola, pero nada prueba el flujo completo: registrarse, entrar, subir una cartola y ver el resumen. Una prueba de integración con la app real armada (base temporal, envío por consola) cubre ese hueco.

Esta idea cubre solo: Smoke test: de la cartola al resumen. El resto del trabajo original está en las ideas hermanas `FOKKO-0112*-SUBS`.

## Depende de
- FOKKO-0082A-SUBS a FOKKO-0082D-SUBS (y el resto del back).

## Alcance
- De la cartola al resumen

## Fuera
- Pruebas de navegador (por ejemplo Playwright): exigen una dependencia nueva y se evalúan después.

## Features afectadas
- `cmd/api` (pruebas de integración)

## Dudas abiertas
- Las pruebas del front quedan con una revisión manual a 390, 768 y 1280 px por pantalla.

## Dudas resueltas
- Fixture: no se commitea ningún PDF. `extract/pdftest.FromText` arma el PDF desde los textos ya
  anonimizados del parser BCI (`bci/testdata/statement_*.txt`), glifo por glifo con los anchos del
  extractor (`extract.GlyphAdvance`) y WinAnsi para las tildes; un test comprueba que el texto vuelve
  igual. Sin dependencias nuevas.
- Con las dos cartolas: Microsoft queda como suscripción mensual ($5.399), Spotify y HostGator como
  posibles; confirmar Spotify como anual la pasa a suscripciones.

## Tareas
- [x] [TASK-001A Subir la cartola](TASK-001A-SMOKE-UPLOAD.md)
- [x] [TASK-001B Resumen de la cartola](TASK-001B-SMOKE-SUMMARY.md)
