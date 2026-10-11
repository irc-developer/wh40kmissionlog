# Plan visual y pantallas

Estado: ejecución coordinada autorizada el 11 de octubre de 2026. Cuatro pantallas y superficies integradas para el catálogo inicial verificado, incluida consulta de reglas generales; contratos acordados, 34 pruebas UI en verde y revisión visual móvil/escritorio realizada. Evidencias y límites en docs/ESTADO-PANTALLAS.md. El recorrido funcional requiere validación de Iván; tácticas y catálogo completo siguen pendientes.

## Base y límites

La variante Asistente del boceto aprobado guía la estética: superficies verdes oscuras o papel claro, bordes finos, marcador grande, tipografía de terminal para cifras y etiquetas, lectura sencilla para las reglas. Sus cartas, cifras, pasos y operaciones son ejemplos. No se trasladan fórmulas ni secuencias a producción sin verificación.

Un operador lleva ambos jugadores. Solo habrá una partida local conservada, en curso o finalizada, y su copia exportable. Historial de partidas, estadísticas, cuentas, sincronización y listas de ejército quedan fuera. El registro de acciones dentro de esta partida sí es necesario para corregir y deshacer.

Se usa el paquete Chapter Approved 2026–2027 y una versión propia del catálogo. El contenido y las capacidades se obtendrán del catálogo normalizado y del motor. Las lagunas de reglas impiden habilitar el comportamiento afectado; no se completan a partir del boceto. No se incluyen referencias, identificadores ni metadatos externos en textos, datos exportados o archivos publicados.

## Inventario estable

Los identificadores siguientes se han aceptado en la revisión del chat Plan de React y arquitectura. Las cuatro pantallas son vistas principales. Los paneles son parte de la vista actual; los diálogos son decisiones breves que requieren una respuesta. En móvil un panel puede ocupar todo el área disponible, sin convertirse en otra pantalla de navegación.

| ID | Tipo | Función |
| --- | --- | --- |
| SCR-HOME | Pantalla | Inicio, carga y recuperación de la única partida local. |
| SCR-SETUP | Pantalla | Preparación y revisión antes de iniciar. |
| SCR-GAME | Pantalla | Marcador, acciones de turno y misiones de ambos jugadores. |
| SCR-RESULT | Pantalla | Resultado, desglose y conservación de la partida finalizada. |
| PNL-RULES | Panel | Lectura de una misión, giro o regla general relevante. |
| PNL-DECK | Panel | Estado del mazo del jugador consultado y acciones permitidas. |
| PNL-LOG | Panel | Desglose y registro de la partida actual, con acceso a corrección. |
| PNL-BACKUP | Panel | Exportar o importar una copia; información del catálogo propio. |
| DLG-CORRECT | Diálogo | Editar una entrada elegible y revisar el efecto antes de aplicar. |
| DLG-UNDO | Diálogo | Confirmar una operación de deshacer con su alcance. |
| DLG-ADVANCE | Diálogo | Revisar pasos pendientes y confirmar avance o finalización. |
| DLG-REPLACE | Diálogo | Confirmar sustitución de la partida conservada por nueva/importada. |
| DLG-UPDATE | Diálogo | Revisar guardado y aplicar una actualización a petición del operador. |

No hay pantalla independiente de ajustes, galería de cartas ni historial. La apariencia puede seguir el sistema con un control claro/oscuro en el menú del terminal; no precisa pantalla ni afecta a la partida.

## Navegación y retorno

1. SCR-HOME carga el almacenamiento. Si no existe partida, ofrece Nueva partida e Importar copia. Si existe, ofrece Continuar o Ver resultado, Copia de seguridad y Nueva partida.
2. Nueva partida abre SCR-SETUP como borrador sin sustituir la partida conservada. Volver permite conservar el borrador en la sesión; se indicará si aún no está guardado. Solo iniciar y confirmar sustitución cambia la partida conservada.
3. SCR-SETUP tiene secciones Jugadores, Misiones y orden, Revisión dentro de la misma pantalla. Atrás entre secciones conserva entradas. Iniciar crea el estado coherente y entra en SCR-GAME cuando su escritura termina.
4. SCR-GAME abre paneles sin perder entradas de puntuación. Cerrar vuelve al mismo jugador, sección, posición y control. Cambiar de jugador conserva el borrador de cada misión en la sesión.
5. El motor indica si una transición termina turno, ronda o partida. El control de avance muestra el destino real. Al finalizar, SCR-RESULT utiliza la partida finalizada, no una copia calculada por React.
6. SCR-RESULT permite consultar reglas, desglose y copia. Reabrir una finalización solo será posible mediante una acción que el motor admita, presentada como Deshacer finalización con DLG-UNDO; no hay botón que fuerce el estado.

Atrás del navegador cierra primero el panel o diálogo visible. Desde una vista principal vuelve a la anterior sin ejecutar acciones del juego. Se acuerdan fragmentos #/inicio, #/preparacion, #/partida y #/resultado; el estado de las superficies se coordina con el historial del navegador, sin rutas públicas de paneles. Cerrar mediante botón y Atrás no debe reabrir accidentalmente una confirmación ni dejar una entrada fantasma. Recuperar después de recargar abre la vista que corresponde al estado duradero; los borradores sin registrar no se anuncian como guardados. La navegación debe funcionar bajo la ruta del repositorio en Pages.

## SCR-HOME — Inicio y recuperación

Orden de lectura: nombre del terminal → estado de carga/almacenamiento → tarjeta de partida conservada → acción principal → importar/nueva → estado de recursos offline.

- Cargando: texto Cargando partida, sin opción prematura de iniciar otra mientras se desconoce el estado local.
- Vacío: breve explicación del uso en un dispositivo, Nueva partida y Importar copia.
- Partida en curso: nombres, marcador, paquete, ronda/turno y última revisión guardada; Continuar es principal. No prometer recuperación de revisiones que no llegaron a guardarse.
- Finalizada: resultado resumido y Ver resultado. Nueva partida conserva el resultado hasta la sustitución confirmada.
- Recuperación fallida o incompatible: explicar el problema, ofrecer reintentar o importar una copia compatible. No borrar automáticamente datos ni mostrar un marcador incompleto como partida válida.
- Catálogo no utilizable: mantener recuperación de una partida compatible que contenga sus definiciones; impedir iniciar con selecciones pendientes y explicar qué falta.

Datos requeridos: resultado de carga, resumen validado de partida, compatibilidad, catálogo disponible, estado del almacenamiento y de recursos offline. Acciones de aplicación: cargar/reintentar, abrir partida/resultado, crear borrador e importar. Abrir una partida no baraja ni añade acciones al registro.

## SCR-SETUP — Preparación

Una pantalla con tres secciones progresivas y un resumen final, sin un asistente rígido de numerosas páginas.

- Jugadores: nombre y facción de ambos, claramente etiquetados Jugador 1 y Jugador 2. El nombre puede repetirse; el identificador interno mantiene la distinción. Entradas editables, validación junto al campo y resumen de errores al continuar.
- Misiones y orden: paquete, primaria, giro cuando corresponda, orden de juego y modalidad de secundarias por jugador. Selecciones fijas aparecen solo para la modalidad y elegibilidad que el motor confirme. Cantidad, opciones, requisitos y dependencias vienen del contrato verificado.
- Revisión: ambos jugadores, quién comienza, selecciones y versión propia del catálogo. Consultar reglas abre PNL-RULES sin perder datos. Iniciar requiere preparación válida, reglas suficientes y almacenamiento disponible.

Las opciones no soportadas muestran Pendiente de verificación con explicación; no ofrecen una fórmula manual inventada. Cambiar paquete/misión no descarta selecciones incompatibles en silencio: se anuncia qué debe revisarse. No hay sorteo automático del orden de juego salvo capacidad verificada.

Datos requeridos: borrador, opciones elegibles y bloqueos, campos requeridos, textos de reglas, resumen validado. Acción de dominio propuesta ACT-CREATE-GAME con configuración revisada; el orden de los mazos y las definiciones queda fijado en la partida creada. Antes de sustituir una partida conservada, DLG-REPLACE permite exportarla. Cancelar conserva ambas propuestas sin sustituir datos. El candidato de creación permanece separado de la partida conservada hasta completar la transacción; fallo o cancelación no sustituyen la referencia actual. La escritura comprueba identidad y revisión de la partida que se pretende sustituir, no solo un número de revisión.

## SCR-GAME — Terminal de partida

Jerarquía vertical en móvil:

1. Cabecera compacta con menú de copia y estado de guardado.
2. Marcador de ambos: nombre, facción y PV, visible sin abrir paneles. Cada jugador es un botón de consulta con selección accesible.
3. Ronda y Turno de [nombre] separados de Viendo a [nombre]. La marca Turno acompaña al jugador del motor; el contorno/etiqueta Consultando acompaña a la selección visual. Se elimina la palabra ambigua ACTIVO del boceto.
4. Asistente contextual con pasos pendientes que devuelve el motor. No fija Robar → Puntuar → Cerrar ni un número de rondas para todos los casos. Cada paso ofrece explicación o acceso a su control.
5. Primaria con ventana/condiciones, campos de evaluación, resultado previsto y acción de registro.
6. Secundarias del jugador consultado: modalidad, cartas activas, estados y ventanas; acceso al mazo.
7. Acceso al desglose y última acción; barra de acciones Deshacer y avance.

Consultar al rival cambia únicamente el contexto visual. El turno, mazos, puntos y registro permanecen iguales. El avance se refiere siempre al turno real y dice Terminar turno de [nombre] si se está consultando al rival. Tras avanzar se enfoca la cabecera de turno y se consulta al nuevo jugador del turno; un anuncio explica el cambio. La selección explícita nunca cambia el turno.

Las cartas muestran título, modalidad, condición resumida, ventana y estado textual. Regla completa disponible en PNL-RULES. No se asume que todas las misiones usen contadores, casillas o una cantidad fija. El contrato de evaluación indica campos, etiquetas, restricciones, opciones y errores; React representa esos controles y solicita la vista previa al motor.

Antes del registro se muestra Previsión +N PV y la diferencia entre valor solicitado y aplicado cuando intervenga un límite. Solo registrar mediante ACT-RECORD-SCORE convierte entradas en puntuación. El botón identifica jugador y misión en su nombre accesible. Doble pulsación no produce otro registro. Una puntuación ya registrada se presenta como registro con acceso a corrección, no como formulario vacío listo para duplicarla.

Mientras exista un borrador, abrir reglas o mazo lo conserva. Si cambia la revisión o la ventana que lo hacía válido, se marca Revisar antes de registrar y se obtiene una nueva evaluación. Un rechazo deja intacta la partida y mantiene las entradas con el error. Consultar otros jugadores nunca permite puntuar fuera de sus ventanas: cualquier acción se rige por capacidades del motor.

El menú ofrece Inicio y Copia de seguridad. Salir a Inicio conserva la partida escrita; con un fallo de guardado explica que hay cambios pendientes y mantiene acceso a reintento/exportación. No comunica que cerrar el navegador conservará un estado pendiente.

## Paneles y diálogos

### PNL-RULES

Encabezado con título y tipo, contexto de la misión/giro, texto legible y secciones de condiciones/puntuación disponibles. Identifica paquete y versión propia del catálogo. El texto de una partida procede de sus definiciones conservadas; actualizar el catálogo no altera su lectura. Para contenidos pendientes se presenta la laguna y la acción bloqueada, sin deducciones. Consultar reglas es una acción visual sin escritura ni entrada de deshacer.

### PNL-DECK

Título Mazo de [nombre], modalidad, cantidades por zona y cartas visibles según la política verificada. No exponer orden futuro, próxima carta ni función de barajar por el mero hecho de consultar. Para modalidad fija, representar selecciones y su estado sin inventar pila de robo.

Robar y descartar aparecen únicamente cuando el motor permita la operación, con su motivo/ventana y alcance. Reponer como control independiente y ACT-REPLACE-CARD son condicionales: requieren una reposición iniciada expresamente verificada en P0; no se presupone su existencia. El destinatario se muestra incluso si no es el jugador del turno. Una reposición automática verificada se resuelve dentro del robo/descarte coherente correspondiente, no mediante dos pulsaciones ni dos guardados. Las cartas retiradas/puntuadas usan las zonas y etiquetas definidas por el motor.

Mazo agotado, carta no elegible y operación bloqueada tienen estados explicados. Un robo aceptado muestra su resultado conservado; cerrar/reabrir/recargar no vuelve a sortear. No se ofrecen acciones extra para sortear un bloqueo.

### PNL-LOG y DLG-CORRECT

Registro de esta partida agrupado por ronda/turno, con filtro de jugador. Incluye primaria/secundarias y demás categorías que el catálogo defina; totales y límites vienen del motor. Cada entrada tiene jugador, momento, misión, observaciones, valor aplicado y estado corregido cuando corresponda.

Corregir abre la entrada por ID estable. Muestra valor/condiciones actuales, motivo de corrección y resultado previsto por el motor, incluidos límites y entradas dependientes afectadas. ACT-CORRECT aplica toda la corrección o la rechaza sin cambio parcial. No hay edición directa del total. Correcciones que exijan alterar cartas o turnos necesitan una capacidad explícita; el plan no ofrece un editor libre del estado.

### DLG-UNDO

La barra muestra Deshacer [última acción reversible]. Abre un resumen del efecto sobre ambos jugadores, cartas, puntos y turno, con Deshacer y Cancelar. ACT-UNDO restaura el conjunto coherente y se guarda como revisión nueva y creciente. Consultar paneles/cambiar jugador no son acciones de deshacer. Si no existe operación reversible, el control explica el motivo. Se acuerda como mínimo propuesto la última operación reversible persistida, disponible también tras reanudar; P0 ratifica su alcance. La interfaz no promete deshacer ilimitado.

### DLG-ADVANCE

El motor devuelve destino y pasos pendientes. Obligatorios: bloqueo con explicación y acceso al control correspondiente. Opcionales/omitibles: confirmar con su consecuencia explícita. Si la última transición finaliza la partida, el diálogo muestra totales y Finalizar partida. No añadir un número fijo de rondas ni condiciones de finalización en React. Cancelar conserva borradores. Avanzar/finalizar es una operación atómica con guardado posterior y protección contra doble pulsación.

### PNL-BACKUP y DLG-REPLACE

Exportar copia identifica jugadores, revisión, fecha local, estado de guardado y versión propia del esquema/catálogo. Se exporta una instantánea coherente, con definiciones, mazos y resultados necesarios para recuperar. Si hay una revisión aceptada pendiente de guardar, se etiqueta Copia de los cambios pendientes; nunca Copia guardada. No convertir una descarga solicitada en promesa de que Iván ya conserva el archivo. La exportación mínima de una instantánea válida mediante formato/serializador propios está disponible desde P1, para fallos de guardado y copia previa a sustitución; P4 completa el panel de copias, importación y compatibilidad.

Importar selecciona archivo, valida esquema, integridad, compatibilidad y reglas conservadas antes de ofrecer vista previa. Vista previa: jugadores, marcador, ronda/turno/resultado y qué partida se sustituirá. Un fallo muestra motivo legible y mantiene la partida actual. DLG-REPLACE solo se ofrece después de validar; incluye exportar actual, Sustituir y Cancelar. El candidato importado permanece separado hasta escritura exitosa y la confirmación compara identidad/revisión objetivo. Escritura fallida no elimina la última copia válida. Importar nunca mezcla dos partidas ni vuelve a barajar.

### DLG-UPDATE

Una actualización disponible ofrece Más tarde o Revisar actualización; no recarga durante una partida. Antes de aplicar, comprobar que la última revisión está guardada, cerrar operaciones pendientes y preservar la partida. Si hay borradores, explicar que no están registrados y permitir volver a ellos o descartarlos expresamente. Si hay fallo de escritura, no habilitar actualización. Tras recargar, recuperar la partida y sus definiciones originales sin cambiar mazos ni puntos.

## SCR-RESULT — Resultado actual

Encabezado Resultado, ambos jugadores y totales, estado de finalización y guardado. Ganador/empate/categorías solo se presentan si el motor proporciona ese resultado conforme al paquete. Desglose por jugador y misión, acceso a PNL-LOG/PNL-RULES, Exportar copia y Nueva partida. No hay estadísticas históricas ni botón Guardar en historial.

Nueva partida inicia un borrador; el resultado permanece conservado hasta confirmar sustitución. Una corrección/finalización deshecha sigue las capacidades del motor y actualiza el resultado o vuelve a SCR-GAME si este lo exige. No recalcular un ganador con una fórmula propia de React.

## Estados transversales propuestos

La red, los recursos offline, la escritura y la disponibilidad de acciones son dimensiones distintas; no se reducen a una única etiqueta LOCAL.

| ID | Presentación y controles |
| --- | --- |
| LOAD-LOADING / LOAD-EMPTY / LOAD-READY | Carga, vacío o recuperación válida; no crear sobre un estado desconocido. |
| LOAD-ERROR / LOAD-INCOMPATIBLE | Reintentar o importar compatible; conservar la copia local. |
| CATALOG-ERROR | Catálogo inválido o inutilizable; impedir nueva preparación afectada y explicar la alternativa de recuperar una partida compatible con definiciones conservadas. Distinto de una regla individual pendiente. |
| SAVE-SAVING | Guardando cambios; no anunciar éxito. Indicar qué revisión está pendiente sin mostrar números técnicos como explicación principal. |
| SAVE-SAVED | Guardado en este dispositivo, solo después de escritura de la revisión mostrada. |
| SAVE-ERROR | No se han guardado los últimos cambios; Reintentar y Exportar cambios. Conservar última revisión válida. |
| SAVE-CONFLICT | Otra pestaña ha cambiado la partida; bloquear mutaciones, permitir copia de memoria y revisar carga actual antes de continuar. |
| ACT-BUSY | Procesando acción; impedir repetición. La partida no tiene un resultado parcial. |
| ACT-BLOCKED | Acción no permitida con razón visible y, cuando exista, paso para resolverla. |
| RULES-PENDING | Contenido o comportamiento sin verificar; consulta informativa, automatismo afectado bloqueado. |
| IMPORT-VALIDATING / IMPORT-READY / IMPORT-ERROR | Validando archivo, vista previa válida o error concreto; sustituir solo desde READY con confirmación y comprobación de revisión. |
| GAME-FINALIZED | Partida finalizada por el motor; SCR-RESULT, con estado de guardado independiente. |
| OFFLINE-PREPARING / OFFLINE-READY / OFFLINE-ERROR | Preparando recursos, Lista para usar sin conexión o descarga incompleta con reintento. Perder red no prueba disponibilidad offline. |
| NET-OFFLINE | Sin conexión, visible como información separada; no impide jugar si los recursos necesarios están disponibles. |
| UPDATE-AVAILABLE / UPDATE-APPLYING / UPDATE-ERROR | Aviso aplazable, aplicación explícita o error con retorno a la partida. |

Propuesta de fiabilidad: permitir una operación de dominio cada vez; antes de aceptar la siguiente mutación exigir que la revisión anterior esté guardada. Durante fallo/conflicto quedan disponibles lectura, reintento y copia, sin acumular nuevas mutaciones. Esto limita la pérdida potencial y simplifica explicar el estado al operador. La selección de jugador y consulta de reglas siguen disponibles.

## Correspondencia con React, dominio y pruebas

Estos nombres son identificadores de planificación; sus campos definitivos se cierran en P0 sin convertir controles visuales en reglas. Las consultas Q-* del plan de React corresponden a los datos visuales así: Q-PREPARACION → SetupOptions/SetupValidation; Q-PARTIDA → GameView/TurnSteps; Q-ACCIONES → AllowedActions; Q-PUNTUACION → EvaluationFields/ScorePreview; Q-MAZO → DeckView; Q-DESGLOSE → ScoreBreakdown/ActionLog; Q-RESULTADO → ResultView; Q-DESHACER → UndoPreview; Q-CORRECCION → CorrectionPreview con recálculo de límites y entradas dependientes; Q-TRANSICION → TransitionPreview con destino, pasos obligatorios/omitibles y consecuencias. Estas dos últimas consultas quedan aceptadas explícitamente en la revisión cruzada: React no suma su impacto por separado. Las definiciones conservadas alimentan PNL-RULES.

| Vista | Datos/consulta requerida | Intención o efecto | Responsable de decisión | Aceptación verificable |
| --- | --- | --- | --- | --- |
| SCR-HOME | LoadResult, SavedGameSummary, compatibilidad/offline | APP-LOAD, UI-RESUME, UI-NEW, APP-RETRY-LOAD | Aplicación y almacenamiento | UX-01 recuperación exacta; UX-02 fallo sin sustituir. |
| SCR-SETUP | SetupDraft, SetupOptions, SetupValidation | ACT-CREATE-GAME | Motor valida; aplicación guarda | UX-03 requisitos/lagunas; UX-04 inicio/sustitución cancelada. |
| SCR-GAME marcador | GameView, selectedPlayerId, activeTurnPlayerId | UI-SELECT-PLAYER | React selecciona; motor fija turno | UX-05 consultar rival sin mutación. |
| SCR-GAME evaluación | EvaluationFields, ScorePreview, AllowedActions | ACT-RECORD-SCORE | Motor evalúa, límites y duplicados | UX-06 vista previa/registro, doble pulsación y rechazo. |
| PNL-RULES | RuleDefinition de partida o catálogo | UI-OPEN-PANEL / UI-CLOSE-PANEL con ID/contexto | Catálogo/definiciones conservadas | UX-07 abrir/cerrar conserva entrada y foco. |
| PNL-DECK | DeckView, AllowedActions, visibilityPolicy | ACT-DRAW, ACT-DISCARD, ACT-REPLACE-CARD | Motor decide y resuelve aleatoriedad | UX-08 zonas independientes; recuperación/deshacer mismos robos. |
| PNL-LOG / DLG-CORRECT | Q-DESGLOSE: ScoreBreakdown/ActionLog; Q-CORRECCION: CorrectionPreview | ACT-CORRECT | Motor valida/recálcula | UX-09 corrección coherente o rechazo sin efectos. |
| DLG-UNDO | UndoPreview, AllowedActions | ACT-UNDO | Motor restaura | UX-10 puntos/cartas/turno restaurados; consulta no entra en deshacer. |
| DLG-ADVANCE | Q-TRANSICION: TransitionPreview/TurnSteps; Q-ACCIONES: AllowedActions | ACT-ADVANCE, ACT-FINALIZE | Motor decide transición | UX-11 pendientes, cancelación, avance/finalización atómicos. |
| SCR-RESULT | ResultView, ScoreBreakdown | UI-NEW, UI-OPEN-PANEL con PNL-LOG, ACT-UNDO si disponible | Motor produce resultado | UX-12 resultado, nueva cancelada conserva partida. |
| PNL-BACKUP / DLG-REPLACE | ExportSnapshot, ImportValidation, ImportPreview | APP-EXPORT, APP-VALIDATE-IMPORT, APP-IMPORT | Aplicación valida y almacena | UX-13 inválida/cancelada/fallida conserva copia válida. |
| Guardado transversal | PersistenceStatus con revisión actual y duradera | APP-RETRY-SAVE | Aplicación/almacenamiento | UX-14 éxito real, error y conflicto sin sobrescritura. |
| Offline / DLG-UPDATE | OfflineStatus, UpdateStatus, borradores y guardado | APP-PREPARE-OFFLINE, APP-APPLY-UPDATE | PWA/aplicación | UX-15 offline real bajo Pages; actualización aplazada y recuperación. |

UI-* son navegación/estado visual, APP-* son operaciones de aplicación y ACT-* son intenciones del dominio. Propietarios y pruebas no se duplican en componentes: motor puro para resultados; interfaz para controles, foco y errores; almacenamiento para escrituras/carga; navegador para recorrido integrado.

## Diseño adaptable y tokens

No se necesita modificar el boceto original para explicar estos acuerdos. El plan mantiene su lenguaje visual con estos ajustes funcionales.

| Token | Claro | Oscuro | Uso |
| --- | --- | --- | --- |
| color-bg | #eeeade | #111713 | Fondo del terminal. |
| color-surface | #f8f5ec | #1a221c | Tarjetas/formularios. |
| color-text | #202a22 | #eeeede | Texto principal. |
| color-muted | #536251 | #a7b4a5 | Texto secundario legible. |
| color-line | #c4cabb | #354338 | Separadores decorativos; no bastan para identificar un control. |
| color-accent | #365432 | #c6d99b | Foco, selección y títulos funcionales. |
| color-selected | #dce5ce | #293b27 | Jugador consultado, junto a borde y texto. |
| color-action / color-on-action | #30472d / #fbfcf4 | #c6d99b / #172013 | Acción principal. |

Los colores de aviso y error deben aprobar contraste antes de implementación, con texto/ícono además del color. Bordes funcionales y foco usan un contraste distinto de los separadores decorativos. Tokens de espacio: 4, 8, 12, 16, 24 y 32 px; esquinas 4–8 px; controles mínimos 44 × 44 px. Texto de lectura 16 px, etiquetas secundarias al menos 12 px, números del marcador 40–48 px adaptables; cifras tabulares. Tipografía de sistema sin descarga externa: Arial/Helvetica/sans-serif para lectura, Consolas/Courier New/monospace para etiquetas y cifras. Evitar largos párrafos en mayúsculas y letra espaciada en instrucciones.

- 320–599 px: una columna, ambos marcadores juntos con nombres que envuelven, tarjetas apiladas y panel desplazable casi a pantalla completa. Formularios amplían filas si contador/etiqueta no caben. Menú accesible de 44 px; nunca ocultar estado de guardado por falta de espacio.
- 600–959 px: contenedor centrado, tarjetas cómodas; panel puede situarse lateralmente si conserva lectura y foco. Sin duplicar controles activos.
- Desde 960 px: marcador y contexto arriba; contenido de misión y panel de consulta pueden compartir dos columnas. La misma selección de jugador y turno gobierna ambas. Ancho total orientativo 1120 px y lectura 65–75 caracteres por línea.
- Barra inferior de acciones con espacio reservado y zonas seguras del dispositivo; no tapa campos, mensajes ni foco. El teclado virtual debe permitir ver la entrada y su error. No usar alturas fijas del boceto ni recortes de reglas.
- Contenido desplazable verticalmente, sin desplazamiento horizontal a 320 px. A 200 % de zoom las columnas vuelven a apilarse. Nombres, títulos y traducciones largas no se truncan sin acceso al texto completo.

## Accesibilidad y aceptación visual

Objetivo de implementación: WCAG 2.2 AA, a verificar con contrastes y recorridos reales. No se declara cumplimiento a partir del boceto.

- HTML semántico, encabezados jerárquicos, etiquetas de campos, instrucciones y errores asociados. Selección de jugador con botones y aria-pressed; turno con texto independiente.
- Todo operable por teclado; foco visible, orden lógico, sin trampas fuera de diálogos. Modal con título accesible, fondo inerte, foco inicial útil, cierre explícito y retorno al disparador. Escape/cerrar cancela decisiones y no registra acciones.
- Panel largo con un único desplazamiento principal; si ocupa toda la pantalla mantiene Cerrar accesible. PNL-RULES sustituye temporalmente DLG-CORRECT/ADVANCE y devuelve intención, borrador y foco al cerrar; no hay dos modales apilados. Antes de ejecutar la intención restaurada se revalida revisión/contexto.
- role=status para guardado y cambios aceptados; errores que requieren actuar se anuncian con prioridad apropiada, sin repetir todo el marcador en cada cambio. El progreso no depende de animación ni se mueve foco durante una escritura de fondo.
- Estados registrados, bloqueados, consultando, turno, sin red y pendiente de guardar se entienden sin color. Una acción bloqueada conserva una explicación accesible fuera de un botón deshabilitado.
- Movimiento reducido y sin parpadeo decorativo. Los íconos acompañan texto salvo controles con nombre accesible inequívoco.

UX-16: revisar 320, 390, 768 y 1280 px, claro/oscuro, nombres largos, muchas cartas, reglas largas, zoom y teclado virtual. UX-17: completar preparación → robar/puntuar → consulta del rival → corregir/deshacer → recarga → finalizar usando teclado y lector de pantalla, sin perder contexto ni datos registrados. UX-18: catálogo inválido e importación en validación/error tienen mensajes distintos; no habilitan iniciar/sustituir ni eliminan la partida conservada. Son criterios futuros, no pruebas ya ejecutadas.

## Orden de entrega y pendientes

1. P0: acordar contratos y comprobar reglas generales, modalidades, ventanas, composición/visibilidad de mazos, límites y finalización. No habilitar controles por el nombre de una carta.
2. P1: SCR-HOME, SCR-SETUP, SCR-GAME y SCR-RESULT con catálogo pequeño verificado; carga/guardado visibles y consulta de reglas. Recorrido completo preparar → registrar → recargar → continuar → finalizar. Incluye las acciones digitales mínimas verificadas que utilice ese recorrido, sin simular una partida táctica omitiendo robos. Incluye protección de doble pulsación, fallo básico, comparación de identidad/revisión y conflicto, y exportación mínima de instantánea válida para error/copia previa desde esta entrega.
3. P2: panel de mazo, registro, corrección, deshacer y bloqueos del motor, con conservación de cartas y revisiones.
4. P3: controles para los comportamientos reales adicionales del catálogo, sin formularios genéricos que prometan reglas ausentes.
5. P4: copia/importación, offline/actualización, accesibilidad y revisión del recorrido con Iván. Fallos/conflictos ya se protegen desde P1 y amplían sus casos en P2; en P4 se verifican también en el navegador de producción y con PWA.
6. P5: recorrido de producción bajo la ruta final de Pages y revisión de los archivos publicados.

Pendientes reales: confirmar flujo Asistente con Iván; verificar reglas y definir campos/ventanas/zonas del catálogo en P0, incluida cualquier reposición expresa y cierre anticipado; ratificar deshacer de última operación persistida y correcciones admisibles; comprobar durabilidad de borradores de preparación si se decide ampliar la conservación más allá de sesión; acordar ruta final de publicación. Ninguno se da por implementado o validado.

## Revisión cruzada

Lectura completa de docs/PLAN-REACT.md realizada el 11 de octubre de 2026, tras su propuesta inicial. Revisión recibida del chat compañero e incorporada: IDs SCR-/PNL-/DLG-, separación de consulta/turno, intenciones UI-/APP-/ACT-, reposición expresa condicional, estados de catálogo/importación/finalización, navegación hash y Atrás, deshacer persistido propuesto, integridad desde P1 y robos reales mínimos en el primer recorrido.

Revisión propia aceptada por el compañero: Q-CORRECCION incluye recálculo de entradas dependientes y Q-TRANSICION pasos obligatorios/omitibles y destino; reglas desde un diálogo sustituyen temporalmente la superficie conservando intención/borrador/foco y revalidan contexto al volver; se retira del mínimo exportar un original inválido como diagnóstico. La recuperación inválida ofrece error legible/reintento/importación y conserva el original local; solo se exportan instantáneas válidas mediante el serializador propio. ACT-REPLACE-CARD permanece condicional y pendiente de verificación.

Conformidad final: este chat ha releído el plan de React revisado, comprobando consultas Q-CORRECCION/Q-TRANSICION, retorno desde reglas, eliminación de exportación inválida, IDs, estados y UX-01…18. El compañero ha leído la versión visual revisada y dado conformidad técnica. Se incorpora su precisión final: exportación mínima desde P1, candidatos nuevos/importados separados hasta escritura exitosa y comparación de identidad más revisión. No quedan diferencias técnicas abiertas entre los dos planes; permanecen los pendientes de reglas, contratos definitivos y validación funcional descritos arriba. Coordinación ha asignado al chat de React la edición de docs/ACOPLAMIENTO.md; este chat mantiene únicamente PLAN-PANTALLAS.md. No se declara implementación ni pruebas de producto ejecutadas.
