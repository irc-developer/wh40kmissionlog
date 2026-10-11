# Plan de React y arquitectura

Estado: plan original conservado como referencia; implementación del primer recorrido integrada el 11 de octubre de 2026. Contratos efectivos y evidencia en docs/ESTADO-REACT.md y docs/IMPLEMENTACION-COORDINADA.md. Los pendientes de catálogo, revisión con Iván y publicación continúan abiertos.

Este documento concreta el trabajo de React y su conexión con motor, guardado y catálogo. Se subordina a `PLAN.md` y está acoplado con `docs/PLAN-PANTALLAS.md`. El chat «Plan de React y arquitectura» mantiene este documento y, por asignación de coordinación, `docs/ACOPLAMIENTO.md`; no edita el plan visual. Los contratos aquí descritos son propuestas acordadas para cerrar sus campos en P0, no tipos ni reglas ya implementados.

## Alcance y límites

Una web mobile first para que un operador gestione ambos jugadores: preparar, jugar con secundarias digitales, puntuar, corregir, deshacer, guardar, recuperar y consultar el resultado de la partida actual. Se conserva la estética de terminal táctico y se toma la variante Asistente como base propuesta. Su recorrido funcional requiere validación de Iván; sus datos y controles ilustrativos no definen reglas.

React y TypeScript, Vite, CSS propio, reducer/context, Dexie, vite-plugin-pwa y GitHub Pages mediante Actions son las decisiones existentes. No añadir inicialmente gestor global externo, biblioteca de componentes, router ni motor genérico de formularios. Vitest, pruebas de interfaz con Testing Library y Playwright cubrirán comportamientos; las dependencias de pruebas se concretan en P0.

El motor será TypeScript puro. No importará React, Dexie, navegador ni red. React no calculará puntos, límites, elegibilidad, composición del mazo ni transiciones del turno. Tampoco decidirá que una condición está cumplida por su texto: capturará hechos del operador y presentará el resultado del motor.

Historial de partidas, estadísticas, cuentas, sincronización y listas de ejército quedan fuera. El desglose y las revisiones necesarias para deshacer pertenecen a la partida actual; no constituyen una biblioteca de partidas.

## Organización y responsabilidad

| Área prevista | Responsabilidad y frontera | Responsable futuro según PLAN.md |
| --- | --- | --- |
| `src/domain/` | Modelo, comandos, consultas, cálculo, invariantes, correcciones y deshacer. Sin efectos externos | Reglas y TDD |
| `src/catalog/` | Datos normalizados, versión propia, validación y cobertura disponible. Sin dependencia de React | Coordinación |
| `src/application/` | Casos de uso que validan, ejecutan y guardan una revisión; bootstrap, importación y recuperación | Coordinación con reglas/guardado |
| `src/storage/` | Puerto de repositorio y adaptador Dexie, transacciones y conflictos. No decide reglas | Guardado y publicación |
| `src/app/` | Composición de dependencias, reducer/context de sesión, navegación y arranque | Interfaz con coordinación |
| `src/features/start/`, `setup/`, `match/`, `result/`, `backup/` | Pantallas y formularios por tarea; consumen consultas y casos de uso | Interfaz |
| `src/components/` y `src/styles/` | Controles realmente compartidos, diálogo, avisos, tokens y CSS de componentes | Interfaz |
| `src/pwa/` | Disponibilidad offline y actualización bajo decisión del operador | Guardado y publicación |

Son directorios previstos, no un scaffold solicitado. Evitar un cajón de `utils` o un componente universal de misión. Crear adaptadores por familias de entrada solo cuando misiones verificadas demuestren que los necesitan. Los tipos públicos viven con quien los define; coordinación acuerda su cambio antes de que otro frente los consuma.

Composición inicial propuesta: `AppShell` contiene navegación, avisos de guardado/actualización y la pantalla actual; un `SessionProvider` proporciona estado y casos de uso. En partida: `Scoreboard`, `TurnContext`, `TurnAssistant`, `MissionPanel`, `SecondaryPanel` y `MatchActions`. `TurnAssistant` recibe pasos del motor: no fija por su cuenta «robar → puntuar → cerrar». `Scoreboard` distingue visualmente jugador consultado y jugador de turno. `MissionPanel` recibe definición congelada, controles de hechos y previsualización del motor; no evalúa fórmulas.

Los formularios conservan borradores mientras se consultan reglas o mazo. El componente que posee el borrador queda montado, o lo mantiene el estado visual de la feature. No colocar puntuaciones calculadas o copias de la partida en estados locales.

## Estados separados

| Capa | Datos que posee | Qué no debe poseer |
| --- | --- | --- |
| Dominio | Identidad y revisión de partida, configuración, jugadores, fase de juego, ronda/turno, mazos y sus zonas, misiones, hechos y entradas de puntuación, definiciones congeladas, resultado y reversión | Diálogos, foco, conexión, indicadores de escritura |
| Aplicación | Carga/validación, revisión actual coherente, revisión persistida, operación en curso, error, repositorio y candidato de importación | Fórmulas alternativas o segundo motor |
| Visual | Pantalla, jugador consultado, panel abierto, borradores, validación de campos, foco y confirmación pendiente | Cambio de turno, puntos aceptados, orden del mazo |

La selección del jugador consultado es UI-SELECT-PLAYER. Toda mutación incluye explícitamente su destinatario, aunque coincida con el consultado, y el motor comprueba si se permite en ese contexto. Consultar al rival conserva turno, cartas, puntos y borradores; no convierte al rival en jugador de turno. Tras un avance aceptado, la propuesta es enfocar al nuevo jugador de turno con un anuncio accesible y abrir un contexto nuevo de puntuación.

La sesión no se guardará desde un efecto de React que observe cualquier render. Los handlers invocan casos de uso; la escritura pertenece a esos casos. El reducer representa resultados y transiciones de la sesión sin ejecutar efectos. El arranque tiene cancelación/identidad de petición para que una respuesta de carga antigua no sustituya una sesión más reciente.

## Pantallas, superficies y navegación propuestas

| ID | Datos y acciones principales | Entrega |
| --- | --- | --- |
| SCR-HOME | Resultado de cargar la partida actual: continuar, preparar otra, importar copia; fallos de carga/compatibilidad y recuperación segura | P1; copias P4 |
| SCR-SETUP | Jugadores/facciones, paquete y versión propia, primaria, giro, orden y modalidad/selección de secundarias. Borrador y elegibilidad; ACT-CREATE-GAME al confirmar | P1; ampliar cobertura P3 |
| SCR-GAME | Consulta completa de la partida; UI-SELECT-PLAYER, puntuar, mazo, desglose, avance y finalización permitidos | P1 y P2 |
| SCR-RESULT | Resultado/desglose de la partida actual, estado de guardado, copia y correcciones/deshacer si el motor los permite; nueva preparación confirmada | P1; recuperación/copia P4 |
| PNL-RULES | Definiciones de la partida, momento y condiciones; cerrar conserva datos introducidos | P1 |
| PNL-DECK | Propietario, modalidad, cartas activas y zonas/conteos autorizados; ACT-DRAW/ACT-DISCARD solo si se permiten | P2 |
| PNL-LOG | Entradas, jugador, momento, puntos y límites aplicados; entrada seleccionada abre DLG-CORRECT | P1 lectura; P2 edición |
| DLG-CORRECT | Hechos originales, hechos propuestos y resultado previsto por el motor; ACT-CORRECT | P2 |
| PNL-BACKUP | Exportar revisión coherente; seleccionar archivo, validar y previsualizar candidato; importar sin sustituir prematuramente | Exportación mínima P1; panel completo/importación P4 |
| DLG-UNDO | Resumen/alcance de la última operación reversible y ACT-UNDO | P2 |
| DLG-ADVANCE | Destino real, pasos pendientes y consecuencias; ACT-ADVANCE o ACT-FINALIZE | P1 |
| DLG-REPLACE | Candidato válido, partida a sustituir, copia previa y confirmación | Nueva partida P1; importación P4 |
| DLG-UPDATE | Revisión guardada, borradores sin registrar y confirmación de recarga | P4 |

Las superficies son paneles/diálogos del contexto, no entidades de dominio. No abrir diálogos encima de otros: cambiar de superficie conserva el borrador y devuelve foco al control que la abrió. PNL-RULES puede sustituir temporalmente DLG-CORRECT o DLG-ADVANCE: guardar intención, borrador, posición y foco de retorno; cerrar reglas restaura esa superficie sin ejecutar la intención. Antes de confirmar se revalida su revisión/contexto. El historial distingue este retorno de cancelar definitivamente el diálogo. En móvil pueden ocupar toda la pantalla; tienen cierre por teclado y un encabezado accesible.

Propuesta de navegación mínima por fragmentos: `#/inicio`, `#/preparacion`, `#/partida`, `#/resultado`, correspondientes a SCR-HOME, SCR-SETUP, SCR-GAME y SCR-RESULT. La parte anterior a `#` sigue siendo la raíz estática del repositorio. Al recargar, el estado real cargado decide qué ruta tiene sentido; una ruta no crea partida ni ejecuta acciones. Las superficies se reflejan en el estado de historial de navegación de la sesión: Atrás cierra primero el panel/diálogo y después cambia pantalla; cerrar mediante botón mantiene ese historial consistente. Un único adaptador procesa fragmentos y eventos de historial sin ciclos ni comandos de juego. Adelante tampoco registra acciones. Si el usuario sale de un formulario con entradas, se preservan en la sesión o se confirma el descarte. Los paneles no necesitan enlaces profundos en la primera versión. Una partida actual finalizada se recupera en SCR-RESULT. Verificar navegación con UX-07/UX-11/UX-17.

## Contratos mínimos para P0

### Catálogo y partida

El catálogo validado contiene identificadores/versiones propios, paquete de misiones, definiciones y capacidades efectivamente verificadas. Para cada comportamiento se distingue disponible o pendiente. El proyecto conserva una matriz de cobertura con IDs propios, resultados esperados y pruebas previstas; las referencias de verificación permanecen en el MCP. La publicación contiene únicamente los campos necesarios para jugar.

Una partida persistible incluye `schemaVersion`, ID propio, `revision`, versión propia del catálogo, configuración aceptada, jugadores con IDs estables, fase de juego, contexto de turno, zonas y orden restante de cada mazo, misiones activas, hechos/entradas de puntuación y reversión disponible. Congela las definiciones y capacidades que necesita para continuar; nunca busca una fórmula nueva por el mismo ID tras actualizar el catálogo. El resultado es derivado de entradas y reglas congeladas, o una proyección validada de ellas, sin duplicar una segunda verdad editable.

El azar es una dependencia explícita al preparar/barajar; su resultado concreto se incorpora a la revisión. Recuperar, previsualizar o reintentar una escritura no llama a esa dependencia. El motor no lee el reloj ni genera IDs de navegador: el caso de uso aporta identidad y contexto donde se necesiten.

### Consultas del motor

Consultas puras sobre la revisión actual, sin mutación ni escritura:

| ID | Resultado que React necesita |
| --- | --- |
| Q-PREPARACION | Campos aplicables, opciones elegibles, errores por campo y requisitos pendientes para empezar |
| Q-PARTIDA | Marcador de ambos, jugador de turno, ronda, fase y pasos pendientes, misiones del consultado, modalidad y contexto de evaluación |
| Q-ACCIONES | Intenciones permitidas y bloqueadas, destinatario/contexto, razón estructurada y datos requeridos |
| Q-PUNTUACION | A partir de hechos del borrador: errores, puntos previstos, desglose y límites aplicados; no crea una entrada |
| Q-CORRECCION | Entrada estable y hechos propuestos: recálculo de límites, entradas/resultados dependientes afectados, alcance permitido o razón de rechazo; no modifica la partida |
| Q-TRANSICION | Destino del avance/cierre y pasos pendientes obligatorios/omitibles, con consecuencias conocidas; no avanza ni finaliza |
| Q-MAZO | Vista autorizada de cartas/zonas/conteos del jugador. No mostrar el futuro orden aleatorio salvo autorización de las reglas verificadas |
| Q-DESGLOSE | Entradas estables, hechos, contribuciones, momento y posibilidades de corrección |
| Q-RESULTADO | Totales y resultado calculado al finalizar, con limitaciones explícitas si las hubiera |
| Q-DESHACER | Disponibilidad, resumen y alcance de la última operación reversible |

Un descriptor de campo expresa una familia conocida de hecho y su validación; no código ejecutable en el catálogo. La UI reconoce tipos implementados; si una misión pide un tipo pendiente, informa de la dependencia y no fabrica un control aproximado. La consulta puede explicar «fuera del momento permitido» o «regla pendiente de verificar»; los códigos son estables y React aporta el texto accesible.

### Acciones y errores

Cada comando lleva identidad de operación, revisión esperada y payload tipado. El dominio recibe estado validado y devuelve éxito con una revisión completa/coherente y resumen observable, o fallo estructurado sin cambio. Los campos exactos se cierran con motor y catálogo en P0. No hay una acción genérica «sumar puntos» que eluda condiciones.

| ID | Intención y datos mínimos | Observación |
| --- | --- | --- |
| ACT-CREATE-GAME | Configuración validada, jugadores, definiciones congeladas y aleatoriedad materializada | No empieza hasta guardar el nuevo estado |
| ACT-DRAW | Jugador, contexto y parámetros permitidos por el motor | Cantidad, momento y reposición por verificar |
| ACT-DISCARD | Jugador, carta activa y motivo reconocido | No asumir que siempre repone o da una recompensa |
| ACT-REPLACE-CARD | Jugador, carta y causa de reposición expresamente permitida | Intención condicional, pendiente hasta verificarla; la reposición automática se resuelve dentro del robo/descarte correspondiente |
| ACT-RECORD-SCORE | Jugador, misión, contexto y hechos observados | El motor recalcula también al registrar |
| ACT-CORRECT | ID de entrada, hechos nuevos y nota/motivo | Reevalúa consecuencias y límites afectados |
| ACT-ADVANCE | Contexto actual y transición ofrecida por el motor | Resuelve pasos pendientes o rechaza; no incrementar ronda en React |
| ACT-UNDO | Operación reversible identificada | Revierte conjuntamente cartas, contexto, entradas y puntos |
| ACT-FINALIZE | Contexto y motivo aplicable | Cierre normal o anticipado solo en los términos que se acuerden/verifiquen |

Operaciones de aplicación, sin fingir comandos de reglas: APP-LOAD, APP-RETRY-LOAD, APP-RETRY-SAVE, APP-EXPORT, APP-VALIDATE-IMPORT, APP-IMPORT, APP-PREPARE-OFFLINE y APP-APPLY-UPDATE. APP-LOAD arranca la carga y APP-RETRY-LOAD la repite tras un fallo; UI-RESUME abre la partida ya validada sin volver a ejecutar reglas. UI-NEW abre preparación; UI-OPEN-PANEL/UI-CLOSE-PANEL reciben ID/contexto de superficie y conservan el retorno; junto con UI-SELECT-PLAYER afectan solo a la vista. Iniciar otra preparación no borra la partida actual; sustituirla requiere confirmación y transacción cuando la nueva partida esté lista.

Errores propuestos: `invalid-input` (campo/dato), `not-allowed` (acción/ventana), `rule-pending` (capacidad ausente), `stale-revision` (contexto antiguo), `already-applied` (operación repetida), `invalid-state` (invariante). Los errores de catálogo/carga/almacenamiento son de aplicación: `invalid-catalog`, `invalid-snapshot`, `unsupported-schema`, `storage-unavailable`, `write-failed` y `write-conflict`. No presentar un fallo técnico como si fuera una regla de juego. Un bloqueo conserva el borrador y explica qué puede hacer el operador.

Las acciones que se vuelven inválidas desde una previsualización se rechazan al registrar. Deshabilitar un botón es una ayuda visual; la corrección se garantiza al comprobar revisión/contexto en la aplicación y el motor. Una pulsación repetida no produce una segunda entrada o segundo robo.

## Guardado, recuperación y concurrencia

Un puerto mínimo de repositorio carga la partida actual y guarda/reemplaza una revisión validada contra una identidad y revisión esperadas de la partida almacenada, incluida la ausencia de partida. Dexie implementa ese puerto. Al sustituir por una partida con otro ID, la comparación sigue apuntando a la partida que se sustituye, no al ID/revisión del candidato. Se comienza con una única partida actual; una copia previa de seguridad para sustitución/migración no abre una funcionalidad de historial.

Secuencia de una mutación:

1. Comprobar que no hay escritura/error pendiente ni confirmación caducada; validar payload y revisión esperada.
2. Ejecutar el motor una vez y conservar la revisión candidata completa en memoria. Si rechaza, no guardar nada.
3. Mostrar la revisión coherente con SAVE-SAVING, sin darla por guardada, y bloquear nuevas mutaciones. Consultas, cierre de paneles y exportación siguen disponibles.
4. Guardar candidato y datos de reversión en una transacción junto con la referencia de partida actual, comprobando la revisión persistida esperada. No realizar red ni diálogos dentro de la transacción.
5. Solo cuando termine, actualizar `persistedRevision`, mostrar SAVE-SAVED y permitir la próxima mutación. La confirmación de creación/importación/sustitución cambia de pantalla tras este éxito.
6. Si falla, SAVE-ERROR conserva el candidato y su ID; reintentar escribe exactamente ese candidato, sin repetir reglas ni azar. El mensaje distingue última revisión guardada de cambios en memoria. Exportar puede salvar el candidato validado. Cerrar/recargar antes de resolver el fallo puede perder los cambios en memoria y así se comunica en ese estado concreto.

En creación/importación/sustitución, mantener candidato separado de la sesión anterior hasta que la transacción confirme; un error no activa el candidato ni elimina la partida conservada. La exportación mínima de snapshots válidos es necesaria desde P1 para error de guardado y copia previa a sustituir; P4 completa panel, importación y compatibilidad. No prometer el control Exportar antes de tener su formato propio validado y serializador.

Propuesta de fiabilidad: una mutación en vuelo por sesión. El repositorio usa comparación de revisión dentro de la transacción; otra pestaña no puede sobrescribir silenciosamente. Ante SAVE-CONFLICT, conservar/exportar el candidato, detener escrituras y ofrecer cargar la revisión almacenada con confirmación. No fusionar automáticamente turnos o cartas. Las respuestas antiguas no pueden marcar como guardada una revisión nueva. La identidad de operaciones repetidas debe sobrevivir al guardado necesario para rechazar su reaplicación.

La recuperación lee, valida y migra explícitamente si existe una migración probada. Conserva orden de mazos, cartas activas/descartadas, contexto, hechos, definiciones y reversión. No rebaraja ni roba. Un esquema desconocido o snapshot incoherente deja la copia original intacta localmente y lleva al estado de recuperación de SCR-HOME con error legible, reintento o importación compatible. No ofrecer exportación bruta del dato inválido ni diagnóstico en el alcance inicial; APP-EXPORT acepta únicamente snapshots válidos del formato propio. No empezar una partida real con un catálogo vacío o incompleto para sus comportamientos.

Deshacer usa una estrategia mínima de estados anteriores de operaciones aceptadas o información reversible equivalente acordada en P0; no requiere event sourcing. La primera versión propone una última operación reversible, disponible también tras recargar. Restaurar contenido anterior crea una revisión nueva y creciente: no reutiliza su número de revisión viejo. Corrección también es una operación coherente, guardada y reversible. Al corregir una entrada antigua, el motor reevalúa todos los límites/resultados afectados; si afecta a decisiones posteriores y no existe una política verificada/implementada, rechaza con razón concreta y propone el alcance seguro, sin ajustar solo el total visual.

### Estados observables de sesión

| ID | Qué muestra/permite la UI | Prueba mínima prevista |
| --- | --- | --- |
| LOAD-LOADING | Arranque/carga; sin nueva mutación o sustitución prematura | Respuesta tardía no cambia sesión nueva |
| LOAD-EMPTY | Inicio disponible; preparación/importación | No mostrar «Continuar» sin snapshot válido |
| LOAD-READY | Partida actual válida, resumen y continuar | Conservación completa tras recarga |
| LOAD-ERROR | Fallo de lectura/almacenamiento, reintento sin borrar | Fallo no tratado como ausencia de partida |
| LOAD-INCOMPATIBLE | Snapshot cargado inválido o no soportado, razón y alternativas | Copia original intacta; no auto-reset |
| IMPORT-VALIDATING / IMPORT-READY / IMPORT-ERROR | Validación, candidato revisable o archivo inválido/incompatible | No sustituir antes de validar y confirmar |
| CATALOG-ERROR | Catálogo inválido, impedir nueva selección; partida congelada compatible sigue recuperable | No confundir fallo estructural con reglas ausentes |
| RULES-PENDING | Campo, opción o acción dependiente de verificación | No afirmar puntuación o disponibilidad inventadas |
| ACT-BUSY / ACT-BLOCKED | Acción en curso o rechazada/no permitida con razón y borrador conservado | Doble pulsación o rechazo sin efectos parciales |
| SAVE-SAVING | Revisión en memoria, mutaciones bloqueadas | Pulsaciones duplicadas sin doble efecto |
| SAVE-SAVED | Última revisión escrita con éxito | Nunca aparece antes de resolver escritura |
| SAVE-ERROR | Cambio coherente sin guardar, reintento/exportación/consulta | Reintento preserva cartas y puntos |
| SAVE-CONFLICT | Otra revisión almacenada, conservar copia y recargar confirmada | Escritura vieja no pisa otra pestaña |
| GAME-FINALIZED | Resultado actual, desglose y acciones permitidas | Recarga abre resultado; corrección coherente |
| OFFLINE-PREPARING / OFFLINE-READY / OFFLINE-ERROR | Preparación, disponibilidad verificada o descarga fallida | Recorrido sobre build sin red y reintento |
| NET-OFFLINE | Sin conexión, independiente del guardado y recursos | No bloquear juego preparado por mera falta de red |
| UPDATE-AVAILABLE / UPDATE-APPLYING / UPDATE-ERROR | Posponer, aplicar bajo condiciones seguras o error recuperable | No recarga por sí sola durante partida |

Estos estados no forman un único enum excluyente: carga, dominio, persistencia y PWA son ejes separados. Offline no significa fallo de guardado local. Un aviso de actualización no oculta un fallo de escritura.

## Validación runtime y copias

Todo catálogo, snapshot y copia entran como datos desconocidos. La validación estructural comprueba versión, tipos, enums, IDs propios y referencias, rangos, tamaños y unicidad. Después se comprueban invariantes de dominio: dos jugadores coherentes, zonas de mazo sin pérdidas/duplicados, contexto válido y entradas/definiciones consistentes. Las migraciones no inventan reglas ausentes. Fijar límites de tamaño y profundidad de importación en P0/P4 a partir del formato real.

Inicialmente se proponen validadores explícitos, compartidos en las fronteras donde corresponda; decidir una biblioteca de esquemas solo si reduce duplicación real. No confiar en casts TypeScript ni ejecutar contenido del catálogo. React representa textos como texto; nada de HTML arbitrario.

La copia tiene versión de formato propia, snapshot, definiciones congeladas, revisión y reversión compatible. Un serializador con campos permitidos construye la exportación; no volcar objetos internos íntegros. El candidato importado se valida fuera de la transacción y muestra jugadores, paquete, versión propia y progreso. Confirmar APP-IMPORT comprueba de nuevo que la sesión objetivo no cambió y sustituye de forma atómica. Archivo inválido, cancelación, conflicto o fallo de escritura dejan la partida actual intacta.

## PWA y GitHub Pages

Se propone registro de actualización con aviso y aplicación expresa. En partida, posponer es siempre posible; aplicar requiere revisión guardada, ausencia de mutación en vuelo y confirmación que explique la recarga. DLG-UPDATE distingue borradores de puntuación/preparación sin registrar: volver a ellos o descartarlos expresamente antes de aplicar. No actualizar durante SAVE-ERROR ni SAVE-CONFLICT. Tras recargar se recupera la revisión y sus definiciones congeladas. El modo de aviso de vite-plugin-pwa permite ofrecer actualización mediante UI: [documentación oficial](https://vite-pwa-org.netlify.app/guide/prompt-for-update.html).

Empaquetar interfaz, iconos, estilos y catálogo requerido; evitar tipografías/CDN necesarios para jugar. OFFLINE-READY exige terminar la preparación de recursos: detectar conexión o registrar el service worker no basta. Probar instalación/primera descarga, recarga sin red y revisión nueva; el funcionamiento prometido empieza después de completar la descarga inicial.

La configuración de producción fija `base` según la URL definitiva de Pages y hace coherentes assets, manifest, `start_url`, scope y service worker bajo esa base. Los fragmentos mantienen las pantallas dentro de la raíz estática. La guía de Vite distingue raíz de dominio y subruta de repositorio: [despliegue en GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages). Los datos locales no se borran al desplegar. Las transacciones del adaptador deben confirmar o abortar la operación completa: [contrato de transacciones de Dexie](https://dexie.org/docs/Dexie/Dexie.transaction()). Revalidar estas decisiones al fijar versiones en P0; este plan no especifica APIs de paquetes ni versiones instaladas.

## Entregas pequeñas y TDD

| Entrega | Incremento integrado | Rojo → verde → refactorizar y aceptación |
| --- | --- | --- |
| R0 / P0 | Cerrar IDs/contratos, validadores, casos reales y cobertura mínima | Preparar resultados esperados desde MCP; pruebas de rechazo estructural e invariantes. Acuerdo de pantallas/estados. Sin declarar reglas aún pendientes como cubiertas |
| R1.1 / P1 | SCR-HOME + SCR-SETUP, Q-PREPARACION y creación guardada; base de SAVE-ERROR/CONFLICT y exportación válida mínima | Primero falla crear/recuperar configuración; integrar motor mínimo + repositorio. Rechazo no sustituye partida; creación conserva definiciones y orden materializado. Una operación cada vez, comparación de identidad/revisión y reintento desde primera escritura |
| R1.2 / P1 | SCR-GAME, marcador, consulta al rival, PNL-RULES y primaria inicial | Primero falla consulta/registro observable de caso verificado; preview no muta; rival no cambia turno; doble registro rechazado |
| R1.3 / P1 | Avance/cierre normal, SCR-RESULT y recuperación | Recorrido preparar → puntuar → guardar → recargar → continuar → finalizar con casos reales mínimos. Turno, mazos y resultado conservados |
| R2.1 / P2 | PNL-DECK y acciones digitales verificadas | Casos de conservación de cartas, independencia, robos/descartes/restricciones y agotamiento según reglas. Recuperación no altera el robo |
| R2.2 / P2 | PNL-LOG, DLG-CORRECT, deshacer persistente | Primero falla corrección con recálculo y reversión de carta/turno/puntos; integrar UI con revisión nueva. Borradores conservados al abrir/cerrar panel |
| R2.3 / P2 | Ampliar pruebas de fallos y conflictos a todas las operaciones | Repositorio controlable: retraso, rechazo y otra revisión. Nunca «Guardado» prematuro; reintento no repite azar; no sobrescribir revisiones nuevas. Las protecciones ya existen desde P1 |
| R3 / P3 | Familias de entrada y catálogo elegido | Añadir cada familia con ejemplos verificados y una misión real; solo ampliar controles necesarios. Cobertura completa requiere matriz sin lagunas en el alcance declarado |
| R4.1 / P4 | PNL-BACKUP, validación y migración segura | Archivo inválido/incompatible no sustituye; copia válida restaura definiciones y reversión. Cancelar conserva sesión |
| R4.2 / P4 | PWA y acabado accesible | Build bajo subruta, sin red, cierre/reanudación y actualización aplazada; teclado, foco, lector de pantalla, 320 px y textos largos |
| R5 / P5 | Publicación preparada | Tipos, análisis estático, pruebas pertinentes y build; recursos/rutas/manifest correctos bajo URL final. Publicación depende del alcance autorizado y datos finales de repositorio |

R1.3 depende de acciones digitales mínimas reales si el recorrido las necesita; no se simula una partida táctica omitiendo reglas de robo. R2 amplía cobertura y controles, no aplaza la verificación de los comportamientos incluidos en P1. P0 puede elegir un subconjunto verificable para primera partida; no empezar con combinaciones cuyo recorrido no se conoce.

Por cambio de comportamiento, comprobar que la prueba falla por ausencia de la necesidad, implementar lo mínimo y refactorizar con verde. Los casos de UI/guardado pueden usar fixtures propias claramente sintéticas para comprobar contratos; esas pruebas no verifican una regla de Warhammer. Las pruebas de reglas necesitan ejemplos/resultados derivados del MCP. Nunca tomar los números del boceto como expectativas.

Capas de prueba: Vitest para motor/validadores; integración de casos de uso con repositorio controlable y adaptador IndexedDB; Testing Library para acciones/errores/borradores/foco observables; Playwright para recorridos críticos y producción/PWA. No probar el número de renders, clases CSS exactas ni estructura interna del reducer. Pruebas de estilos mediante inspección móvil y accesibilidad; configuración/documentación con comprobaciones apropiadas. Revisar fallos de escritura y multi-tab en un navegador real, además de dobles de prueba.

## Correspondencia de consultas y datos

Los nombres de datos del plan visual son las proyecciones de estas consultas, no otros estados editables: Q-PREPARACION → SetupOptions/SetupValidation; Q-PARTIDA → GameView/TurnSteps; Q-ACCIONES → AllowedActions; Q-PUNTUACION → EvaluationFields/ScorePreview; Q-CORRECCION → CorrectionPreview; Q-TRANSICION → TransitionPreview; Q-MAZO → DeckView/visibilityPolicy; Q-DESGLOSE → ScoreBreakdown/ActionLog; Q-RESULTADO → ResultView; Q-DESHACER → UndoPreview. LoadResult/SavedGameSummary, PersistenceStatus, ImportValidation/ImportPreview, ExportSnapshot y OfflineStatus/UpdateStatus pertenecen a aplicación, repositorio o PWA. SetupDraft y selectedPlayerId pertenecen a la vista. activeTurnPlayerId viene del dominio.

## Matriz de aceptación compartida

| Pantalla/superficie | Consultas y comandos | Estados imprescindibles | Responsable / evidencia |
| --- | --- | --- | --- |
| SCR-HOME | APP-LOAD/APP-RETRY-LOAD, Q-PARTIDA/Q-RESULTADO, UI-RESUME/UI-NEW | LOAD-LOADING/EMPTY/READY/ERROR/INCOMPATIBLE, CATALOG-ERROR | Aplicación+guardado+UI / UX-01/02 recarga exacta o fallo sin borrar |
| SCR-SETUP | Q-PREPARACION, ACT-CREATE-GAME | RULES-PENDING, CATALOG-ERROR, SAVE-SAVING/ERROR/CONFLICT | Catálogo+motor+UI / UX-03/04 elegibilidad y sustitución cancelada/fallida |
| SCR-GAME marcador | Q-PARTIDA, UI-SELECT-PLAYER | Contexto de turno distinto de consulta | Motor+UI / UX-05 rival consultado sin mutación |
| SCR-GAME evaluación | Q-PUNTUACION/Q-ACCIONES, ACT-RECORD-SCORE | ACT-BUSY/BLOCKED, RULES-PENDING, SAVE-* | Motor+aplicación+UI / UX-06 registro, rechazo y doble pulsación |
| PNL-RULES | Definiciones congeladas, UI-OPEN-PANEL/UI-CLOSE-PANEL con ID/contexto | RULES-PENDING donde corresponda | Catálogo+UI / UX-07 conserva borrador, foco e historial de panel |
| PNL-DECK | Q-MAZO/Q-ACCIONES, ACT-DRAW/ACT-DISCARD; ACT-REPLACE-CARD condicional | ACT-BUSY/BLOCKED, SAVE-*; agotamiento según motor | Motor+UI / UX-08 conservación, independencia y recuperación |
| PNL-LOG / DLG-CORRECT | Q-DESGLOSE/Q-CORRECCION, ACT-CORRECT | ACT-BLOCKED, SAVE-* | Motor+UI / UX-09 recálculo completo o rechazo |
| DLG-UNDO | Q-DESHACER/Q-ACCIONES, ACT-UNDO | ACT-BLOCKED, SAVE-* | Motor+UI / UX-10 cartas, turno y puntos restaurados |
| DLG-ADVANCE | Q-TRANSICION/Q-ACCIONES, ACT-ADVANCE/ACT-FINALIZE | Pasos pendientes, ACT-BLOCKED, SAVE-* | Motor+UI / UX-11 cancelación o transición coherente |
| SCR-RESULT | Q-RESULTADO/Q-DESGLOSE/Q-DESHACER, UI-NEW, ACT-CORRECT/ACT-UNDO si disponibles | GAME-FINALIZED, SAVE-* | Motor+UI / UX-12 resultado y nueva cancelada conserva partida |
| PNL-BACKUP / DLG-REPLACE | APP-EXPORT/APP-VALIDATE-IMPORT/APP-IMPORT | IMPORT-VALIDATING/READY/ERROR, SAVE-* | Aplicación+guardado+UI / UX-13 copia inválida/cancelada/fallida no sustituye |
| Guardado global | PersistenceStatus, APP-RETRY-SAVE | SAVE-SAVING/SAVED/ERROR/CONFLICT | Aplicación+guardado / UX-14 éxito real y no sobrescritura |
| PWA / DLG-UPDATE | OfflineStatus/UpdateStatus, APP-PREPARE-OFFLINE/APP-APPLY-UPDATE | OFFLINE-*, NET-OFFLINE, UPDATE-* | PWA+aplicación+UI / UX-15 offline real, actualización aplazada y borradores |

SAVE-*, OFFLINE-* y UPDATE-* abrevían exclusivamente los estados enumerados, no comodines que habiliten nuevas acciones. UX-16/17 del plan visual añaden móvil, zoom, teclado y lector de pantalla al recorrido; UX-18 distingue errores de catálogo/importación de lagunas de reglas e impide sustituciones/inicios inválidos. Los ejes de error y actualización estarán accesibles globalmente, incluidos SCR-HOME, SCR-SETUP y SCR-RESULT; no restringirlos al pie de SCR-GAME.

## Pendientes y revisión cruzada

- Leídas íntegramente las propuestas inicial y revisada del plan visual el 11 de octubre de 2026 y comprobados sus ajustes finales; enviada revisión concreta y aceptada su revisión propia. Incorporados IDs comunes, consultas explícitas de corrección/transición, retorno temporal desde reglas, mazo visible autorizado, revisión de actualización con borradores y retirada de diagnóstico bruto. Dada conformidad técnica al plan visual y recibida su conformidad final al plan React, incluida exportación válida mínima P1 y sustitución contra identidad/revisión esperada. No quedan diferencias técnicas abiertas entre documentos. Matriz y decisiones registradas en ACOPLAMIENTO.md; las lagunas de reglas y contratos siguen pendientes.
- Pendiente validar con Iván el recorrido funcional de Asistente y el comportamiento de borradores/confirmaciones propuesto.
- Pendiente P0: reglas generales y de misiones del primer recorrido, tiempos/cantidades de mazos, límites y último turno, efectos de giros, cierre anticipado y política segura de correcciones dependientes. Este encargo no las ha verificado ni implementado.
- Pendiente P0: contratos definitivos del motor/repositorio, alcance inicial de deshacer (se propone última operación persistida), formato y migraciones soportadas; versiones de dependencias.
- Pendiente P4/P5: formato de copia y límites, revisión accesible/mobile, URL y configuración final de Pages, prueba offline sobre producción.

Este plan no declara estados de PLAN.md completados. No se han creado componentes, proyecto Vite, catálogo ni pruebas ejecutables.


## Contratos efectivos del primer recorrido

Acuerdo entre los dos chats de ejecución: `src/domain/types.ts` define catálogo, snapshot, intenciones y consultas; `src/application/ui-contract.ts` define modelo y acciones de la terminal. React compone `MissionTerminal` mediante `SessionProvider`. La UI posee navegación, superficies, selección y borradores; el motor posee puntuaciones y acciones permitidas.

El repositorio compara identidad y revisión en una transacción, incluida ausencia de partida. Guardar, reintentar, crear y sustituir están centralizados en `SessionController`. Una importación conserva contenido, reglas y reversión con una nueva identidad propia para evitar que una pestaña antigua vuelva a resultar válida.

CorrecciónPreview muestra entradas afectadas, puntos anteriores/nuevos, marcador y resultado proyectados. Deshacer conserva la última operación completa y crea una revisión creciente. El contexto de evaluación incluye fase, ronda y jugador de turno.

Catálogo 0.3.0: una primaria, cuatro secundarias fijas y cuatro reglas generales consultables. `RuleDefinition.category` admite `general`, sin objetivos y con `fixed:false`; `SetupOptions.generalRules` procede del catálogo actual. En partida, `GameView.rules` procede de las definiciones congeladas. Las copias compatibles anteriores sin generales siguen siendo válidas.

La actualización puede aplicarse sin borradores o tras aceptar su descarte; siempre exige guardado resuelto. La activación de una actualización desde otra pestaña se anuncia y no provoca recarga automática. Revisión pendiente de Iván y cobertura fuera del catálogo inicial detalladas en los documentos de estado.
