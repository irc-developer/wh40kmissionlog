# Plan de wh40kmissionlog

Estado: primer recorrido integrado implementado y verificado; catálogo inicial 0.3.0. P1 completado; P2–P5 con avances y pendientes explícitos. Evidencia detallada en docs/ESTADO-REACT.md y docs/ESTADO-PANTALLAS.md.

## Objetivo y alcance

Llevar una partida completa de Warhammer 40K desde un dispositivo: preparar ambos jugadores, gestionar misiones y mazos digitales, registrar puntuaciones, corregir, deshacer y reanudar. La interfaz será mobile first, con estética de terminal táctico, y se publicará en GitHub Pages.

Incluido en la primera versión:

- Preparación: jugadores, facciones, paquete de misiones, primaria, giro, orden de juego y modalidad de secundarias de cada jugador.
- Marcador de ambos, ronda, turno y misiones activas.
- Secundarias fijas y tácticas, con mazos independientes y acciones respaldadas por reglas verificadas.
- Puntuación asistida, límites, correcciones y desglose.
- Guardado automático, recuperación y copia exportable/importable.
- Funcionamiento sin conexión después de completar la descarga inicial.
- Resultado de la partida actual.

Fuera de esta versión: biblioteca de partidas, estadísticas, cuentas, sincronización entre dispositivos y gestión de listas de ejército.

## Decisiones de tecnología

| Responsabilidad | Elección |
| --- | --- |
| Interfaz | React y TypeScript |
| Construcción | Vite |
| Estilos | CSS propio, con estilos organizados por componentes |
| Estado de aplicación | Reducer y context de React; acciones y reglas en el motor |
| Guardado | IndexedDB mediante Dexie |
| Uso sin conexión | vite-plugin-pwa; actualizaciones a demanda |
| Pruebas | Vitest para reglas y contratos; pruebas de interfaz y Playwright para recorridos |
| Publicación | GitHub Pages mediante GitHub Actions |

El catálogo del MCP se incorporará como datos versionados con identificadores propios. La web publicada no necesita conectarse al MCP para jugar. La partida conserva las definiciones utilizadas para que una actualización no modifique sus reglas.

Por indicación de Iván, interfaz, documentación, catálogo, copias exportadas y archivos publicados no incluirán referencias a la aplicación de origen. La comprobación de reglas y su trazabilidad permanecen en el MCP; los entregables usarán identificadores y versiones propios.

## Reparto de responsabilidades

| Responsable | Trabajo propio | Áreas futuras |
| --- | --- | --- |
| Coordinación principal | Verificación/exportación inicial del MCP, contratos compartidos, estructura de proyecto, integración y revisión | Catálogo, documentación, contratos y configuración común |
| Reglas y TDD | Motor de partida, puntuaciones, mazos, acciones válidas, correcciones y deshacer | src/domain/ y pruebas correspondientes |
| Interfaz | Preparación, partida, resultado, terminal táctico y accesibilidad | src/features/, src/components/ y src/styles/ |
| Guardado y publicación | Repositorio de partidas, Dexie, exportar/importar, PWA y preparación de Pages | src/storage/, src/pwa/ y configuración de publicación coordinada |

Los nombres de áreas son orientativos hasta cerrar el hito P0. Ningún frente cambia contratos compartidos sin coordinar la actualización. La interfaz no accede directamente a IndexedDB; el almacenamiento no decide reglas.

La planificación detallada se desarrolla en dos chats por encargo de Iván: «Plan visual y pantallas» y «Plan de React y arquitectura». Elaboran sus documentos propios y los revisan entre sí antes de implementar. El reparto funcional de la tabla sigue siendo la referencia para la futura implementación.

- Plan visual: docs/PLAN-PANTALLAS.md.
- Plan de React: docs/PLAN-REACT.md.
- Coordinación y correspondencia entre ambos: docs/ACOPLAMIENTO.md.

Esta división describe el encargo de planificación original; el encargo de ejecución posterior se recoge a continuación.

El 11 de octubre de 2026 Iván encarga dos chats nuevos para ejecutar estos planes y sincronizarse. El reparto de ejecución, archivos y protocolo se fija en docs/IMPLEMENTACION-COORDINADA.md: pantallas controla la presentación y React asume arquitectura, motor, catálogo, guardado e integración. Los chats de planificación se conservan como referencia. Los estados siguientes se actualizan con comprobaciones de la implementación, no por el encargo de arranque.

## Contratos que cerraremos primero

- Catálogo: identificador propio, versión propia, paquete de misiones, definiciones y comportamientos verificables. Exportar solo los campos necesarios para jugar y recuperar partidas.
- Partida: identificador, versión de esquema, revisión, configuración, jugadores, ronda/turno, mazos, misiones activas, entradas de puntuación y estado de finalización.
- Acciones: intenciones tipadas para preparar, robar, descartar, puntuar, corregir, avanzar, deshacer y finalizar. Un error no deja cambios parciales.
- Consultas: marcador, desglose, misiones activas, acciones disponibles y pasos pendientes del turno.
- Guardado: cargar partida activa y guardar una revisión coherente; errores y conflictos identificables.
- Interfaz: jugador consultado separado del jugador cuyo turno está activo.

Guardar el orden de los mazos y los resultados de las acciones aleatorias. La recuperación no genera nuevos robos. Deshacer debe restaurar las cartas junto con el resto de la partida. No se requiere un sistema completo de event sourcing.

## Hitos y tareas

### P0 — Fundamentos y reglas verificadas

- [x] Coordinación: establecer estructura, comprobaciones de calidad y contratos mínimos.
- [x] Coordinación: revisar reglas generales del paquete y preparar un catálogo inicial normalizado, con la verificación trazable en el MCP.
- [x] Reglas: convertir reglas verificadas en casos de ejemplo y pruebas esperadas.
- [x] Todos: acordar datos compartidos y límites de responsabilidad.

Aceptación: los tres frentes pueden consumir los mismos tipos y casos de uso; toda regla del primer recorrido tiene verificación en el MCP y resultado esperado. Revalidar contenido y cobertura al exportar. Los archivos del catálogo y los entregables no incluyen metadatos ni referencias a la aplicación de origen.

Comprobar expresamente: preparación y elegibilidad, composición de mazos, momento y cantidad de robos, reposiciones, descartes y agotamiento; momentos y límites de puntuación, quién empieza, último turno y efectos del giro. Registrar lagunas antes de automatizar.

### P1 — Primera partida de principio a fin

- [x] Reglas: preparación, estado de partida y primera primaria/selección de secundarias verificadas mediante TDD.
- [x] Interfaz: inicio, preparación y pantalla de partida con marcador de ambos.
- [x] Guardado: contrato de repositorio y adaptador Dexie con sus pruebas.
- [x] Coordinación: integrar preparar → jugar → puntuar → guardar → recargar → continuar → finalizar.

Aceptación: recorrido funcional con un catálogo pequeño de misiones reales. La recarga conserva ambos jugadores, turno, cartas y puntos. No es todavía la versión con catálogo completo.

P0 y P1 se cierran para el primer recorrido con una primaria y cuatro secundarias fijas. Las lagunas de tácticas, otras primarias y giros se registran en docs/COBERTURA-CATALOGO.md; no se consideran reglas implementadas. Las consultas quedan en el MCP; un registro adicional allí no pudo escribirse por un error de ruta autorizada.

### P2 — Mazos digitales y correcciones

- [ ] Reglas: completar acciones de mazo, restricciones y ventanas de puntuación verificadas.
- [x] Reglas: impedir acciones inválidas y registros duplicados; implementar correcciones y deshacer.
- [ ] Interfaz: controles de robo/descarte, consulta de reglas y explicación de acciones bloqueadas.
- [x] Guardado: persistir todas las acciones y conservar la última versión válida ante fallos.

Aceptación: los mazos de ambos son independientes. Robos, descartes, puntos y deshacer sobreviven a la recuperación. Consultar al rival no avanza la partida. Las escrituras antiguas no sobrescriben estados nuevos.

P2: las selecciones fijas, ventanas, registros, correcciones y última reversión persistida están verificadas. El panel de mazo explica los bloqueos de robo y descarte en modalidad fija; las acciones de mazo táctico siguen pendientes.

### P3 — Catálogo completo del alcance elegido

- [ ] Coordinación: exportar el catálogo completo y revisar cobertura real.
- [ ] Reglas: incorporar familias de puntuación, fijas/tácticas, giros y excepciones con pruebas derivadas de fuentes.
- [x] Interfaz: representar los tipos de condición y controles que realmente necesiten las misiones.
- [x] Coordinación: mantener matriz misión propia → comportamiento verificado → pruebas → estado; conservar las referencias de origen en el MCP.

Aceptación: toda misión incluida tiene sus comportamientos revisados. No declarar cobertura completa si existen reglas pendientes. Las adaptaciones manuales justificadas deben ser explícitas y guardar una nota; no ocultar fórmulas sin verificar.

P3: incorporadas todas las secundarias elegibles como fijas disponibles en la consulta y una primaria. Existe matriz de cobertura; quedan las demás primarias, tácticas y giros.

### P4 — Fiabilidad y acabado móvil

- [x] Guardado: exportar/importar partidas con esquema y referencias validados.
- [x] Guardado: PWA, recursos empaquetados y avisos de disponibilidad offline/actualización.
- [x] Interfaz: accesibilidad, estados de guardado/fallo y confirmaciones de sustitución de partida.
- [ ] Coordinación: revisar el flujo con Iván y probar construcción de producción en móvil y escritorio.

Aceptación: tras la descarga inicial, recargar sin red, jugar, cerrar y reanudar funciona. Una importación inválida no reemplaza la partida. Una actualización no recarga silenciosamente durante el juego y conserva sus datos.

### P5 — Preparación y publicación en GitHub Pages

- [ ] Coordinación: concretar repositorio, rama y dirección final.
- [x] Guardado/publicación: preparar Actions, ruta base, manifest, scope y navegación.
- [ ] Coordinación: comprobar el recorrido bajo /<repositorio>/ y publicar dentro del alcance autorizado por Iván.

Aceptación: construcción, recursos y funcionamiento offline correctos bajo la ruta final; comprobaciones en verde antes de desplegar. La publicación conserva los datos locales al actualizar.

Comprobar también que archivos construidos, documentación, catálogo y exportaciones no contienen referencias ni metadatos de la aplicación de origen.

## Dependencias y trabajo paralelo

P0 precede al desarrollo integrado. Después, motor, interfaz y repositorio pueden avanzar en paralelo con los contratos acordados. Cada frente entrega porciones pequeñas y verificables que coordinación integra durante P1 y P2.

La incorporación de todo el catálogo depende de haber validado el recorrido inicial. La PWA se verifica sobre la construcción de producción, cuando existe una partida funcional. La configuración definitiva de Pages depende de la dirección final.

## TDD y criterios de cierre

Por cada cambio de comportamiento: prueba que falla por la necesidad real → implementación mínima → refactorización con pruebas en verde.

Pruebas críticas:

- Ejemplos de puntuación derivados de fuentes, límites acumulados y excepciones.
- Conservación de cartas entre zonas y aislamiento de jugadores.
- Acciones inválidas y dobles pulsaciones sin efectos indebidos.
- Deshacer robo, descarte, puntuación y avance.
- Correcciones con recálculo de los límites afectados.
- Guardar/restaurar sin alterar turno, mazos ni puntuación.
- Importaciones inválidas y fallos de escritura sin perder la última partida válida.
- Recorrido integrado con recarga y repetición sin conexión.

Para aceptar una tarea: comportamiento probado, tipos y comprobaciones pertinentes correctos, construcción válida y documentación de decisiones materiales actualizada. No crear pruebas que simplemente reflejen la implementación.

En interfaz: funcionamiento desde 320 px sin desplazamiento horizontal, controles táctiles amplios, teclado y foco visibles, etiquetas accesibles, estados comprensibles sin depender solo del color y conservación de entradas al consultar reglas.

## Primer paquete de trabajo

El primer paquete P0/P1 está integrado. El siguiente trabajo pendiente es completar cobertura de reglas y mazos tácticos cuando se resuelva su agotamiento, revisar el recorrido con Iván y concretar repositorio/URL de publicación. La web actual permite revisar una partida completa con misiones fijas.
