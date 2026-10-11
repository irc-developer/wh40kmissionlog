# Estado de implementación de pantallas

Actualizado: 11 de octubre de 2026. Implementación integrada; revisión funcional con Iván pendiente. Este registro distingue evidencia de UI y alcance de reglas pendiente.

## Contratos y responsabilidad

Leídos AGENTS.md, PLAN.md, ambos planes, ACOPLAMIENTO.md e IMPLEMENTACION-COORDINADA.md. Verificada la autorización directa de Iván para comunicación entre los dos chats de implementación. Revisado el contenido del boceto como referencia visual; sus ejemplos no son reglas.

Conformidad mutua: MissionTerminal desde src/features/terminal/MissionTerminal.tsx, TerminalProps desde src/application/ui-contract.ts, montaje mediante el adaptador de React y src/styles/terminal.css. UI posee hash/historial, jugador consultado, paneles, borradores y foco. Motor/aplicación poseen cálculo, permisos, revisiones, candidatos y escritura. UI no accede a almacenamiento ni calcula puntuaciones.

Campos boolean/integer; corrección recibe cambios por entrada, totales y resultado recalculados. Confirmaciones conservan revisión objetivo; sustitución/importación conservan identidad y revisión del destino. Última reversión persistida y borradores solo en sesión ratificados. Importación recibe identidad propia nueva para impedir que una copia antigua reactive una pestaña obsoleta, conservando reglas, cartas y puntuaciones.

## Entregas implementadas

| Incremento | UI entregada | Estado verificable |
| --- | --- | --- |
| P0 | Tokens claro/oscuro, estructura móvil, contrato por props y superficies accesibles | Acuerdo y contrastes comprobados; no acredita cobertura total de reglas |
| P1 | Inicio, preparación, partida, resultado, consulta de reglas, guardado y exportación | Integrado; recorrido completo de producción comunicado en verde por React |
| P2 | Mazo consultado, desglose, corrección, deshacer, avance y conflicto | Capacidades verificadas; tácticas/azar siguen bloqueados |
| P3 | Campos y selecciones desde catálogo, cuatro fijas consumibles sin fórmulas en UI | Cobertura del catálogo a cargo de React; no catálogo completo |
| P4 | Copias, validación/importación, sustitución, avisos PWA y actualización explícita | Probado por contrato y producción, incluidos conflicto, recuperación incompatible y actualización real |
| P5 | Hash compatible con subruta de repositorio | Prueba de subruta por React; publicación real pendiente |

Capacidades pendientes se explican en preparación y permisos. La lectura de mazo fijo no representa pila de robo ni ofrece barajar.

## Archivos propios

- src/features/terminal/MissionTerminal.tsx: composición, sesión visual, selección y borradores.
- src/features/terminal/SetupScreen.tsx: preparación, errores del motor y revisión.
- src/features/terminal/FactFields.tsx: controles y errores asociados a observaciones.
- src/features/terminal/TerminalSurfaces.tsx: paneles y decisiones desde el contrato.
- src/features/terminal/navigation.ts: hash, Atrás/Adelante y superficies sin comandos.
- src/components/SurfaceDialog.tsx: diálogo nativo, cancelación y foco.
- src/styles/terminal.css: presentación adaptable, tokens y controles táctiles.
- Pruebas junto a componentes; fixtures sintéticas verifican interacción, no reglas.
- docs/screenshots/terminal-mobile.jpg: captura móvil con reglas conservadas del catálogo propio 0.1.0.

## TDD y comprobaciones

34 pruebas UI verdes; 65 pruebas conjuntas en 10 archivos. Se comprobaron rojos por componentes ausentes y por comportamientos pendientes antes de implementar. Casos verificados:

- Consulta del rival sin modificar turno, puntos, cartas ni borradores.
- Reglas conservan entradas y devuelven foco. Corrección conserva hechos/motivo y muestra rechazo dentro del diálogo visible.
- Previsión, límites y efectos completos vienen del motor. Doble pulsación produce una sola intención.
- Guardando no anuncia éxito. Error ofrece reintento/copia; creación fallida conserva partida y activa candidato solo tras escritura exitosa.
- Nuevo contexto consulta al jugador del turno. Borrador de revisión distinta requiere revisar la nueva previsión.
- Última confirmación no pisa Resultado. Deshacer conserva Resultado si el motor mantiene finalización.
- Avance enfoca contexto de turno; cancelar vuelve al disparador sin mutación.
- Atrás cierra consulta sin registrar/deshacer. Copia inválida no importa; conflicto exige confirmar carga y ofrece copia.
- Cargar una revisión almacenada abre Partida o Resultado desde el modelo, sin que el final tardío de la carga fuerce Inicio.
- Una partida incompatible permite validar una copia y confirmar su sustitución; carga pendiente o fallo de lectura bloquean la importación. No se ofrecen datos incompatibles como una exportación válida.
- Actualización disponible no recarga; borradores requieren descarte expreso. Entradas aceptadas dejan de contarse como borradores.
- Los borradores de preparación incluyen primer jugador, preparación para la batalla, modo y giro, además de nombres y misiones.
- Errores de evaluación asociados a sus campos y controles bloqueados por el motor.
- Consulta de reglas generales distingue textos congelados en partida y textos actuales al preparar; partidas anteriores sin generales permanecen compatibles.

Tipos y análisis estático comprobados; construcción de producción bajo /wh40kmissionlog/ en verde. React mantiene construcción y pruebas integradas. Siete recorridos de producción en verde, con salida de ejecución verificada:

1. Preparación, puntuación, consulta del rival, recarga y finalización bajo subruta.
2. Recarga y nueva escritura sin red, conservando la partida.
3. 320 px sin desplazamiento horizontal y consulta de reglas con retorno de foco.
4. Corrección, recarga, deshacer, exportación e importaciones inválida/válida, conservando puntuaciones y reglas.
5. Conflicto entre pestañas sin sobrescritura; carga almacenada tras confirmación.
6. Actualización real aplazada y aplicada expresamente, recuperando la partida guardada.
7. Dato local incompatible: copia inválida conserva el dato; copia validada y confirmada lo sustituye.

jsdom no implementa modalidad nativa: la fixture comprueba handlers/retorno. En navegador real se verificaron fondo inerte, Escape y foco; no se atribuye esta garantía al doble técnico.

## Revisión visual real

Comprobados en navegador: preparación real, registro de primaria, consulta del rival y reglas, nombre largo y turno separado de selección. 320, 390, 768 y 1280 px sin desplazamiento horizontal; claro/oscuro inspeccionados. Foco tras avance verificado en «Contexto del turno».

Contrastes por luminancia: texto principal 12,33:1 claro / 15,50:1 oscuro; secundario 5,96:1 / 7,53:1; avisos/errores >=6,58:1; bordes funcionales >=4,53:1. Casillas con etiqueta táctil amplia. Condiciones largas desplegables y consulta completa en reglas. No se declara WCAG completo: lector de pantalla, teclado virtual y zoom real necesitan revisión adicional.

## Recorrido revisable con Iván

1. Preparar jugadores, primaria, orden y dos secundarias fijas por jugador.
2. Consultar reglas antes de iniciar; volver sin perder selecciones. Iniciar y observar guardado confirmado.
3. Avanzar a una ventana permitida, preparar observaciones, abrir reglas y consultar al rival; comprobar «Turno» frente a «Consultando».
4. Registrar, abrir desglose, corregir con motivo y revisar efectos. Cancelar/confirmar deshacer.
5. Recargar y continuar. Exportar copia; validarla antes de confirmar sustitución.
6. Completar última transición y comprobar Resultado; revisar ventanas, controles y confirmaciones.

La aprobación visual previa sigue vigente; este recorrido funcional no ha sido validado aún por Iván. No se han creado más chats/agentes. La publicación se coordina en React por encargo posterior de Iván; esta evidencia de UI no acredita publicación.

## Dependencias pendientes

- Tácticas, composición/agotamiento de mazos, giros y catálogo restante: React verifica antes de habilitar.
- Reglas generales congeladas: categoría general sin objetivos y SetupOptions.generalRules integradas; catálogo propio 0.3.0 sin cambiar partidas conservadas anteriores.
- Revisión funcional de Iván; lector de pantalla, teclado virtual y zoom; datos definitivos de Pages.

React actualiza PLAN.md solo desde evidencia integrada; este documento no cierra hitos globales por promesa.
