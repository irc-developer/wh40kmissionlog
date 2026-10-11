# Coordinación de planes visual y React

Estado: plan original conservado como referencia; implementación del primer recorrido integrada el 11 de octubre de 2026. Contratos efectivos y evidencia en docs/ESTADO-REACT.md y docs/IMPLEMENTACION-COORDINADA.md. Los pendientes de catálogo, revisión con Iván y publicación continúan abiertos.

## Encargo de Iván

«Crea una conversa que se encargue de toda la parte visual, en la que se definirá el plan de las pantallas que vamos a necesitar. Por otro lado, haremos la parte de react en otra diferente generando también el plan. Que se hablen entre ellas y acoplen sus planes.»

Iván autoriza la comunicación entre los dos chats de este encargo. El mensaje original está en el chat de coordinación, identificador 01a12ba8-1d4c-7262-bab3-186691be7e47. Cada chat puede verificar ese mensaje con las herramientas de lectura antes de enviar mensajes al otro.

## Responsabilidades y archivos

| Chat | Responsabilidad | Documento propio |
| --- | --- | --- |
| Plan visual y pantallas | Pantallas, navegación, estados, componentes visuales, accesibilidad y criterios de aceptación | docs/PLAN-PANTALLAS.md |
| Plan de React y arquitectura | Componentes React, estado, contratos con motor/guardado, pruebas, integración y entregas | docs/PLAN-REACT.md |
| Coordinación | Mantener el plan general y el reparto | PLAN.md |
| Plan de React y arquitectura, tras conformidad del chat visual | Registrar los acuerdos comunes y el cierre de la revisión | docs/ACOPLAMIENTO.md |

Los chats comparten la carpeta del proyecto. Cada uno edita su documento propio y puede leer el resto. El chat de React también mantendrá este documento de acuerdos, incorporando cambios comunes tras conformidad del chat visual; el chat visual no lo editará directamente. Esta restricción pertenecía al encargo de planificación; el encargo posterior autoriza la implementación según docs/IMPLEMENTACION-COORDINADA.md.

## Referencia visual

Boceto aprobado: C:/Users/plata/.codex/visualizations/2026/10/11/01a12ba8-1d4c-7262-bab3-186691be7e47/terminal-tactico.html.

La variante Asistente es la base de planificación propuesta. Sus números, cartas y acciones son ejemplos; no se consideran reglas ni un contrato funcional aprobado.

## Acoplamiento requerido

1. Crear una propuesta inicial en el documento propio a partir de AGENTS.md y PLAN.md.
2. Enviar al chat compañero un resumen y la ruta del documento, con necesidades y dependencias concretas.
3. Leer y revisar la propuesta recibida: detectar estados sin pantalla, controles sin acción, requisitos de datos ausentes y límites de responsabilidades.
4. Intercambiar la revisión y resolver diferencias. Incorporar los acuerdos al documento propio.
5. Usar los mismos identificadores de pantallas, acciones y estados relevantes. Mantener una correspondencia pantalla → datos → acciones → responsables → pruebas.
6. Registrar la revisión cruzada con acuerdos y cuestiones pendientes reales. No declarar el acoplamiento cerrado sin haber leído y revisado el plan compañero.

El chat de React registrará aquí la matriz final de correspondencia y el estado del cierre después de la revisión mutua. Ambos planes deben indicar los mismos acuerdos y distinguir las reglas pendientes de verificación de las decisiones de interfaz ya acordadas.

Mantener los mensajes de coordinación concretos, agrupar preguntas y evitar intercambios repetitivos sin decisiones nuevas.

## Criterios comunes

- Un operador gestiona ambos jugadores desde un dispositivo.
- Consultar otro jugador no cambia el turno de juego.
- Mazos digitales, guardado automático y recuperación; historial para una fase posterior.
- Diseño mobile first con terminal táctico; accesibilidad y adaptación a pantallas grandes.
- TDD y clean code; motor separado de React y almacenamiento.
- Catálogo verificado mediante MCP con identificadores propios y sin metadatos de origen en entregables.
- La interfaz representa las acciones disponibles del motor; no inventa reglas ni fórmulas.
- Indicar guardado solo tras completarse la escritura; actualizaciones aplazables durante una partida.

## Identificación de los chats

| Chat | Identificador | Host |
| --- | --- | --- |
| Plan visual y pantallas | 01a12be5-b68a-7981-a738-166aa8108eae | local |
| Plan de React y arquitectura | 01a12be5-f268-7032-995e-254ce44030f4 | local |

## Documentos revisados y conformidad

- `docs/PLAN-PANTALLAS.md`: inventario, recorridos, estados, diseño adaptable, accesibilidad y criterios UX-01 a UX-18.
- `docs/PLAN-REACT.md`: organización de aplicación, consultas/comandos, guardado, validación, recuperación, PWA, TDD e integración R0 a R5.
- Ambos chats leyeron el documento compañero, intercambiaron propuesta y revisión concreta e incorporaron los cambios. React dio conformidad técnica al plan visual; el chat visual releyó la revisión de React y dio conformidad final. React comprobó después los ajustes finales del documento visual, incluidos exportación mínima desde P1 y candidatos separados hasta escritura exitosa.

Las cuatro pantallas, cuatro paneles y cinco diálogos usan los mismos IDs en ambos planes. Los contratos de consultas y acciones son acuerdos de planificación: sus campos definitivos y capacidades de reglas se cierran en P0. No se han creado componentes, motor, catálogo incorporado ni pruebas ejecutables en este encargo. No se han cambiado los estados de PLAN.md.

## Decisiones compartidas

1. Un operador consulta y gestiona ambos jugadores. `selectedPlayerId` es visual; `activeTurnPlayerId` viene del motor. El marcador distingue Turno y Consultando. Consultar al rival no modifica turno, cartas, puntuación ni reversión. Tras avance aceptado se consulta al nuevo jugador del turno con foco/anuncio adecuados.
2. React representa consultas puras y capacidades del motor. No calcula puntos/límites, no fija fases de robo o número de rondas y no inventa condiciones por nombres de cartas. Q-CORRECCION describe el recálculo completo de entradas dependientes; Q-TRANSICION describe destino, pasos obligatorios/omitibles y consecuencias.
3. UI-* cambia navegación/vista, APP-* ejecuta casos de uso de aplicación y ACT-* expresa intenciones de dominio. Cada mutación comprueba identidad de operación, contexto y revisión esperada. ACT-REPLACE-CARD solo existe como capacidad condicional si se verifica una reposición iniciada expresamente; reposición automática verificada es parte del robo/descarte atómico.
4. Una mutación en vuelo por sesión; antes de la siguiente, exigir la revisión guardada. Guardar una revisión coherente con sus mazos y reversión. SAVE-SAVED solo tras escritura completa. Durante SAVE-ERROR se conserva el candidato en memoria; reintentar no repite reglas ni azar y lectura/copia siguen disponibles. En conflicto no se fusionan ni sobrescriben automáticamente partidas.
5. Creación/importación/sustitución mantienen candidato separado de la partida conservada hasta transacción exitosa. La comparación del repositorio apunta a la identidad y revisión que se sustituyen, incluida ausencia de partida. Archivo inválido, cancelación, conflicto o fallo de escritura no sustituyen la partida actual. Confirmaciones caducadas se revalidan antes de aplicar.
6. Recuperación conserva definiciones/versiones propias, contexto, zonas y orden de mazos, robos, puntos y reversión; no rebaraja. Se propone como mínimo última operación reversible persistida; P0 ratifica alcance y política de correcciones. Deshacer crea una revisión nueva y creciente. No hay editor libre de totales, cartas o turno.
7. Borradores se conservan en la sesión al cambiar jugador o consultar paneles; no se anuncian como guardados. PNL-RULES sustituye temporalmente DLG-CORRECT/ADVANCE conservando intención, borrador, foco y posición; al cerrar vuelve a ese contexto y se revalida. No se apilan modales activos.
8. Navegación por `#/inicio`, `#/preparacion`, `#/partida`, `#/resultado` bajo la raíz estática del repositorio. El historial de sesión registra superficies: Atrás cierra primero la visible y luego cambia pantalla; botón Cerrar mantiene historial coherente. Atrás/Adelante no ejecuta acciones ni deshace jugadas. Recargar decide vista a partir de la partida validada.
9. Catálogo/importaciones/snapshots se validan en runtime, además de sus invariantes. Identificadores/versiones propios y serializador de campos permitidos. Exportar únicamente snapshots válidos del formato propio; datos originales inválidos quedan intactos localmente, con error/reintento/importación compatible. Exportación bruta o diagnóstico de inválidos queda fuera del mínimo.
10. Exportación válida mínima desde P1 para error de guardado y copia previa a sustituir; P4 completa panel de copias, importación y compatibilidad. Etiquetar copia de cambios pendientes de forma distinta de revisión guardada; solicitar descarga no acredita que el archivo se haya conservado.
11. Recursos offline, red, guardado y actualización son dimensiones independientes. OFFLINE-READY requiere preparación efectiva de recursos. Actualización aplazable y explícita; no aplicarla con escritura/conflicto pendiente. Revisar borradores sin registrar y descartar solo expresamente. Tras recarga conservar partida y definiciones congeladas.
12. Motor TypeScript puro separado de React y Dexie; aplicación centraliza validación, ejecución y guardado. Reducer/context para representar sesión y estado visual; sin nuevas librerías o abstracciones generales hasta justificar su necesidad. TDD por comportamiento y pruebas de usuario; fixtures técnicas no acreditan reglas de juego.

## Matriz final: pantallas, datos, acciones, estados y pruebas

Los nombres de datos corresponden a proyecciones/contratos previstos; no son una segunda partida editable. SAVE-*, OFFLINE-* y UPDATE-* abrevian solamente los estados enumerados después. Todos los estados globales se representan también fuera de SCR-GAME cuando proceda.

| Pantalla o superficie | Datos y consultas | Acciones o efecto | Estados relevantes | Responsable / aceptación |
| --- | --- | --- | --- | --- |
| SCR-HOME | LoadResult, SavedGameSummary, compatibilidad; Q-PARTIDA/Q-RESULTADO para resumen válido | APP-LOAD, APP-RETRY-LOAD, UI-RESUME, UI-NEW | LOAD-LOADING/EMPTY/READY/ERROR/INCOMPATIBLE, CATALOG-ERROR | Aplicación+guardado+UI / UX-01 recuperación exacta; UX-02 fallo sin borrar |
| SCR-SETUP | SetupDraft; Q-PREPARACION → SetupOptions/SetupValidation; definiciones de selección | ACT-CREATE-GAME; UI-OPEN-PANEL con PNL-RULES | RULES-PENDING, CATALOG-ERROR, SAVE-* | Catálogo+motor+UI / UX-03 requisitos; UX-04 cancelación y creación/sustitución segura |
| SCR-GAME marcador | Q-PARTIDA → GameView/TurnSteps; selectedPlayerId y activeTurnPlayerId separados | UI-SELECT-PLAYER | Contexto del motor y selección visual, sin cambio de dominio | Motor+UI / UX-05 rival consultado sin mutación |
| SCR-GAME evaluación | Q-PUNTUACION → EvaluationFields/ScorePreview; Q-ACCIONES → AllowedActions | ACT-RECORD-SCORE | ACT-BUSY/BLOCKED, RULES-PENDING, SAVE-* | Motor+aplicación+UI / UX-06 preview, registro, duplicados y rechazo |
| PNL-RULES | RuleDefinition de catálogo o definiciones congeladas de partida | UI-OPEN-PANEL/UI-CLOSE-PANEL con ID/contexto | RULES-PENDING donde corresponda; retorno conservado | Catálogo+UI / UX-07 entradas, foco e historial de panel |
| PNL-DECK | Q-MAZO → DeckView/visibilityPolicy; Q-ACCIONES | ACT-DRAW, ACT-DISCARD; ACT-REPLACE-CARD condicional | ACT-BUSY/BLOCKED, SAVE-*; agotamiento según motor | Motor+UI / UX-08 zonas independientes y recuperación de mismos robos |
| PNL-LOG / DLG-CORRECT | Q-DESGLOSE → ScoreBreakdown/ActionLog; Q-CORRECCION → CorrectionPreview con dependencias | ACT-CORRECT | ACT-BLOCKED, SAVE-*; intención/borrador preservados | Motor+UI / UX-09 recálculo coherente o rechazo sin efecto |
| DLG-UNDO | Q-DESHACER → UndoPreview; Q-ACCIONES | ACT-UNDO | ACT-BLOCKED, SAVE-* | Motor+UI / UX-10 restauración conjunta de cartas, turno y puntos |
| DLG-ADVANCE | Q-TRANSICION → TransitionPreview; Q-ACCIONES; pasos de turno | ACT-ADVANCE, ACT-FINALIZE | Pasos obligatorios/omitibles, ACT-BLOCKED, SAVE-* | Motor+UI / UX-11 cancelar o avanzar/finalizar atómicamente |
| SCR-RESULT | Q-RESULTADO → ResultView; Q-DESGLOSE/Q-DESHACER | UI-NEW, UI-OPEN-PANEL con PNL-LOG/PNL-RULES; ACT-CORRECT/ACT-UNDO si permitidos | GAME-FINALIZED, SAVE-* | Motor+UI / UX-12 resultado conservado y corrección/reversión permitida |
| PNL-BACKUP / DLG-REPLACE | ExportSnapshot, ImportValidation/ImportPreview, identidad/revisión objetivo | APP-EXPORT, APP-VALIDATE-IMPORT, APP-IMPORT; ACT-CREATE-GAME para nueva confirmada | IMPORT-VALIDATING/READY/ERROR, SAVE-* | Aplicación+guardado+UI / UX-13 inválida/cancelada/fallida no sustituye |
| Guardado global | PersistenceStatus: revisión actual, duradera y candidato cuando proceda | APP-RETRY-SAVE; copia; cargar versión almacenada tras conflicto confirmado | SAVE-SAVING/SAVED/ERROR/CONFLICT | Aplicación+guardado / UX-14 éxito real y no sobrescritura |
| PWA / DLG-UPDATE | OfflineStatus/UpdateStatus, guardado y borradores | APP-PREPARE-OFFLINE, APP-APPLY-UPDATE | OFFLINE-*, NET-OFFLINE, UPDATE-* | PWA+aplicación+UI / UX-15 offline real bajo Pages, actualización aplazada y recuperación |
| Todas las vistas | Contenido real, estados y recorridos anteriores | Teclado, foco, consulta y confirmaciones accesibles | Textos largos, zoom, errores visibles sin depender de color | UI+navegador / UX-16 móvil/zoom; UX-17 teclado/lector; UX-18 catálogo/importación distintos de lagunas |

La partida es dueña de hechos aceptados y reglas congeladas. SetupDraft, selección y borradores son visuales; LoadResult, PersistenceStatus, ImportPreview y estados PWA pertenecen a aplicación/infraestructura. Los cálculos y acciones válidas pertenecen al motor.

## Estados compartidos

| Eje | IDs acordados | Distinción |
| --- | --- | --- |
| Carga | LOAD-LOADING, LOAD-EMPTY, LOAD-READY, LOAD-ERROR, LOAD-INCOMPATIBLE | Ausencia de partida distinta de fallo o dato inválido; ningún auto-reset |
| Catálogo/reglas | CATALOG-ERROR, RULES-PENDING | Catálogo inválido distinto de comportamiento sin verificar; recuperar partida congelada compatible sigue siendo posible |
| Acción | ACT-BUSY, ACT-BLOCKED | En curso o no permitida; razón estructurada y sin efecto parcial |
| Persistencia | SAVE-SAVING, SAVE-SAVED, SAVE-ERROR, SAVE-CONFLICT | Revisión duradera distinta de cambio en memoria; impedir nuevas mutaciones hasta resolver |
| Importación | IMPORT-VALIDATING, IMPORT-READY, IMPORT-ERROR | Confirmar solo candidato válido, revalidando sesión objetivo |
| Dominio proyectado | GAME-FINALIZED | Resultado producido por motor, con guardado independiente |
| Recursos offline | OFFLINE-PREPARING, OFFLINE-READY, OFFLINE-ERROR | Preparación efectiva e incompleta distinguibles |
| Red | NET-OFFLINE | Falta de red no equivale a error de escritura local |
| Actualización | UPDATE-AVAILABLE, UPDATE-APPLYING, UPDATE-ERROR | Aviso aplazable, aplicación explícita o error recuperable |

## Entregas alineadas

| Hito general | Incrementos React | Pantallas y garantías visuales |
| --- | --- | --- |
| P0 | R0: contratos mínimos, validación y resultados esperados desde reglas comprobadas | Cerrar campos/capacidades, matriz y políticas antes de habilitar controles |
| P1 | R1.1 creación/recuperación; R1.2 puntuación/consulta; R1.3 avance/resultado | Cuatro pantallas, PNL-RULES, guardado básico y exportación válida mínima. Incluir las acciones digitales reales que necesite el recorrido. Desde primera escritura: una operación, doble pulsación, fallo y comparación de identidad/revisión |
| P2 | R2.1 mazos; R2.2 corrección/deshacer; R2.3 ampliar fallos/conflictos | PNL-DECK/LOG, DLG-CORRECT/UNDO y bloqueos; conservar robos/reversión al reanudar |
| P3 | R3: familias y catálogo del alcance elegido | Solo controles requeridos por comportamientos verificados; cobertura honesta de lagunas |
| P4 | R4.1 panel de copias/importación; R4.2 PWA y acabado | Importación segura, DLG-UPDATE, offline real, navegador de producción y validación móvil/accesible con Iván |
| P5 | R5: preparación/publicación final | Recursos, navegación y datos conservados bajo URL de Pages definida |

Por cada comportamiento: prueba que falla por necesidad real → implementación mínima → refactorizar con verde. Motor y repositorio se prueban por resultados, UI por controles/errores/foco y navegador por recorridos integrados. Las comprobaciones de este encargo han sido documentales: lectura cruzada, correspondencia de IDs y consistencia de tablas. UX-01 a UX-18 son aceptación futura, no pruebas pasadas.

## Pendientes reales y criterio para resolverlos

| Pendiente | Responsable futuro | Evidencia de cierre |
| --- | --- | --- |
| Validar recorrido funcional de Asistente | Interfaz+coordinación con Iván | Recorrido revisado y decisiones registradas; el boceto solo tiene aprobación visual |
| Reglas generales y primer subconjunto de misiones, secundarias fijas/tácticas, elegibilidad, mazos/visibilidad, robos/reposiciones/agotamiento, giros, límites, último turno y finalización | Coordinación+reglas, mediante MCP | Comportamientos y resultados esperados verificados; trazabilidad en MCP, IDs/versiones propios en entregables |
| Cierre anticipado y política de correcciones que afectan decisiones posteriores | Reglas+coordinación | Capacidad explícita, casos esperados y rechazo seguro donde corresponda |
| Campos definitivos de comandos/consultas/snapshots/repositorio, validadores, formato propio y migraciones | Coordinación+responsables de motor/guardado/UI en P0 | Contratos compatibles revisados y casos observables; no cambiar unilateralmente |
| Ratificar mínimo de última reversión persistida y ampliar profundidad solo si se acuerda | Motor+guardado+UI en P0 | Alcance anunciado coincide con pruebas de restauración y recarga |
| Durabilidad de borradores más allá de sesión, si se decide ampliar | Interfaz+coordinación | Decisión explícita; por defecto no prometer guardado de entradas sin registrar |
| Catálogo completo del alcance elegido y familias de controles | Coordinación+reglas+UI en P3 | Matriz de cobertura sin comportamientos pendientes dentro del alcance declarado |
| Compatibilidad de copias, límites, PWA, contraste, accesibilidad y producción offline | Guardado/PWA+UI+coordinación en P4 | Copia segura y recorridos UX pertinentes sobre build real |
| Repositorio/rama/URL final, versiones de dependencias y configuración de Pages | Coordinación+publicación en P0/P5 | Configuración comprobada bajo base/scope finales y controles de calidad en verde |

Los chats no detectan diferencias técnicas abiertas entre sus planes. El cierre documental no elimina las dependencias anteriores ni autoriza deducir reglas ausentes. La implementación posterior cierra el recorrido P0/P1 y parte de P2/P4; los estados vigentes están en PLAN.md y docs/ESTADO-REACT.md.

## Contratos efectivos del primer recorrido

Acuerdo entre los dos chats de ejecución: `src/domain/types.ts` define catálogo, snapshot, intenciones y consultas; `src/application/ui-contract.ts` define modelo y acciones de la terminal. React compone `MissionTerminal` mediante `SessionProvider`. La UI posee navegación, superficies, selección y borradores; el motor posee puntuaciones y acciones permitidas.

El repositorio compara identidad y revisión en una transacción, incluida ausencia de partida. Guardar, reintentar, crear y sustituir están centralizados en `SessionController`. Una importación conserva contenido, reglas y reversión con una nueva identidad propia para evitar que una pestaña antigua vuelva a resultar válida.

CorrecciónPreview muestra entradas afectadas, puntos anteriores/nuevos, marcador y resultado proyectados. Deshacer conserva la última operación completa y crea una revisión creciente. El contexto de evaluación incluye fase, ronda y jugador de turno.

Catálogo 0.3.0: una primaria, cuatro secundarias fijas y cuatro reglas generales consultables. `RuleDefinition.category` admite `general`, sin objetivos y con `fixed:false`; `SetupOptions.generalRules` procede del catálogo actual. En partida, `GameView.rules` procede de las definiciones congeladas. Las copias compatibles anteriores sin generales siguen siendo válidas.

La actualización puede aplicarse sin borradores o tras aceptar su descarte; siempre exige guardado resuelto. La activación de una actualización desde otra pestaña se anuncia y no provoca recarga automática. Revisión pendiente de Iván y cobertura fuera del catálogo inicial detalladas en los documentos de estado.
