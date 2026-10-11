# Implementación coordinada de pantallas y React

Estado: implementación del primer recorrido integrada y verificada el 11 de octubre de 2026. El reparto permanece vigente; tareas y pendientes en PLAN.md, con evidencia en los documentos de estado.

## Autorización y referencias

Iván ha pedido: «Con los planes que tenemos para pantallas y react quiero que abras dos nuevas conversaciones en los que las dos agentes lleven a cabo cada una uno de los planes y se sincronicen entre ellas.»

La autorización directa para implementar y comunicarse está en el chat de coordinación `01a12bf3-ee92-7fc3-a40f-d8e7ea555978`, host `local`. Cada agente debe leer ese mensaje antes de enviar mensajes al chat compañero: este documento facilita su localización y no sustituye la autorización directa.

Referencias: AGENTS.md, PLAN.md, docs/PLAN-PANTALLAS.md, docs/PLAN-REACT.md y docs/ACOPLAMIENTO.md. Las restricciones de no implementar de los documentos anteriores corresponden al encargo de planificación ya cerrado; este nuevo encargo autoriza su implementación. Las dependencias de reglas, contratos y validación funcional siguen vigentes.

## Responsables y archivos

| Chat nuevo | Trabajo y archivos propios |
| --- | --- |
| Implementar pantallas y terminal táctico | Ejecutar PLAN-PANTALLAS.md: src/features/, src/components/, src/styles/ y pruebas de UI correspondientes; docs/PLAN-PANTALLAS.md y docs/ESTADO-PANTALLAS.md. |
| Implementar React y arquitectura | Ejecutar PLAN-REACT.md: scaffold y configuración raíz, src/domain/, src/catalog/, src/application/, src/storage/, src/app/, src/pwa/, pruebas de estas capas y configuración de navegador; docs/PLAN-REACT.md, docs/ACOPLAMIENTO.md, docs/ESTADO-REACT.md y PLAN.md. Mantiene este registro común tras acuerdo con pantallas. |

La agente de React asume también la coordinación técnica, reglas y almacenamiento previstos como frentes futuros en PLAN.md, para que el reparto actual de dos chats permita una implementación integrada. La agente de pantallas es responsable de presentación y experiencia; los cálculos y acciones del juego pertenecen al motor.

Los archivos de configuración, dependencias, entrada, composición y contratos públicos tienen una sola escritora: React. Pantallas solicita los cambios necesarios por mensaje. React no edita archivos de pantallas sin entrega explícita; pantallas no modifica contratos por su cuenta. Las pruebas de UI viven junto a sus componentes; React mantiene la configuración común y coordina las pruebas integradas. Los nombres concretos de módulos públicos y exports se acuerdan en P0 antes de consumirlos.

## Secuencia y sincronización

1. Leer planes y autorización directa. React recibe la identificación del chat de pantallas en un mensaje de arranque; pantallas recibe la de React en su encargo inicial. No enviar mensajes a los chats de planificación antiguos.
2. Intercambiar propuesta de P0: módulos, comandos/consultas públicos, estado de sesión, interfaz del repositorio, exports de UI, montaje y pruebas. Registrar acuerdo de ambas antes de implementar consumidores de contratos compartidos.
3. React prepara estructura, herramientas y verificación de reglas mediante el MCP. Pantallas revisa el boceto aprobado y puede preparar tokens, estructura visual y criterios de accesibilidad independientes de contratos/reglas pendientes. El boceto está en C:/Users/plata/.codex/visualizations/2026/10/11/01a12ba8-1d4c-7262-bab3-186691be7e47/terminal-tactico.html.
4. Implementar por incrementos P0/R0, P1/R1.1–R1.3, P2/R2 y siguientes. Intercambiar entregas concretas: contratos/versiones, archivos, comprobaciones y dependencias. Ante un cambio de contrato, acordarlo primero, actualizarlo con una sola escritora y avisar al consumidor.
5. Aplicar TDD a comportamiento; verificar tipos, análisis estático, construcción y recorridos críticos según el incremento. Los fixtures sintéticos no acreditan reglas reales. No habilitar capacidades pendientes ni trasladar ejemplos del boceto al motor.
6. Cada agente registra su evidencia en su documento de estado. React actualiza PLAN.md solo desde trabajo integrado y verificado; los bloqueos reales se documentan y permiten continuar trabajo independiente. Evitar mensajes de acuse repetidos sin decisiones nuevas y ciclos de activación sin trabajo nuevo.
7. Validación del recorrido con Iván y datos finales de publicación siguen siendo dependencias explícitas. Preparar un resultado concreto revisable; no publicar ni inventar repositorio/URL sin el alcance y los datos necesarios.

## Criterios de integración

- La UI consume proyecciones y acciones del motor; consultar jugador no cambia turno.
- Guardado confirmado, recuperación de los mismos mazos/robos, reversión coherente y sustitución atómica.
- Reglas verificadas y cobertura honesta; IDs/versiones propios. Referencias de origen únicamente en el MCP.
- Cuatro pantallas y superficies previstas, móvil desde 320 px, foco/teclado, borradores y errores comprensibles.
- Comprobaciones pertinentes en verde y estado documentado sin afirmar cobertura o validaciones pendientes.

## Chats de ejecución

| Chat | Identificador | Host |
| --- | --- | --- |
| Implementar pantallas y terminal táctico | 01a12bf7-a1b0-7611-b99a-615833965f23 | local |
| Implementar React y arquitectura | 01a12bf7-2f1f-7e10-bc9f-5a36da9b0958 | local |

Los chats anteriores de planificación se conservan como referencia.

## Entrega integrada

P0/P1 del catálogo inicial y parte de P2/P4 están implementados. Ambos chats acordaron los contratos, correcciones y snapshot de reglas; las pruebas de UI y de producción verifican sus consumidores. Guardado, copias, recuperación incompatible, conflicto y actualización conservan el estado según las comprobaciones registradas. La revisión de Iván y las reglas fuera de cobertura permanecen pendientes.

Por nueva indicación de Iván se prepara la conexión con un repositorio GitHub nuevo con el nombre del proyecto. Iván indica que ya lo ha creado y pide visibilidad privada. El repositorio local usa main y origin apunta a https://github.com/irc-developer/wh40kmissionlog.git. La versión inicial fue subida por Iván; publicación de la web y disponibilidad de Pages para el repositorio privado siguen pendientes de comprobación.
