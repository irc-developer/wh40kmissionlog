# Estado de React y arquitectura

11 de octubre de 2026. Primer recorrido integrado y verificado. Catálogo propio 0.3.0; esquema de partida y copia 1. Las capacidades pendientes no se presentan como terminadas.

## Implementación

- Motor TypeScript puro: preparación, ventanas, puntuaciones, límites por ronda/partida/fija, cinco rondas, resultado, correcciones y última operación reversible persistida. El jugador consultado no modifica el turno.
- Catálogo: Dominio del campo de batalla y las cuatro secundarias fijas disponibles; cuatro reglas generales consultables. IDs/versiones propios, definiciones conservadas dentro de la partida y validación en tiempo de ejecución. Matriz en COBERTURA-CATALOGO.md.
- Aplicación: SessionController centraliza ejecución y escritura. Una mutación en vuelo; revisión guardada separada del candidato. Reintentar conserva el mismo estado y la misma operación. Creación/importación activan la sustitución tras escritura completa.
- Guardado: Dexie y comparación atómica de identidad/revisión, incluida ausencia. Los conflictos no sobrescriben ni se fusionan. Recuperación de snapshot compatible sin cambiar reglas, cartas, turno, puntuaciones o reversión.
- Copias: formato propio estricto, tamaño limitado, referencias y puntuaciones revalidadas. Importar conserva contenido y asigna nueva identidad. Una copia compatible puede sustituir un snapshot JSON incompatible leído, previa confirmación y comparación atómica del dato completo; si cambia, se rechaza. Los errores de lectura permanecen bloqueados.
- React: SessionProvider representa el modelo y compone MissionTerminal. La UI posee navegación, superficies, selección, borradores y foco; no accede al almacenamiento ni calcula reglas.
- PWA: recursos empaquetados y disponibilidad offline comprobada. Actualización explícita, aplazable y con guardado resuelto. La activación desde otra pestaña se anuncia sin recarga automática.
- Pages: comprobaciones automáticas y publicación manual preparadas. Construcción bajo /wh40kmissionlog/ verificada. Iván ha indicado que ha creado el repositorio wh40kmissionlog y ha elegido visibilidad privada. Repositorio conectado: https://github.com/irc-developer/wh40kmissionlog, rama main. La primera versión ya fue subida por Iván; queda sincronizar el último ajuste de documentación. Repositorio local inicializado con rama main.

## Contratos acordados con pantallas

`src/domain/types.ts` y `src/application/ui-contract.ts` son los contratos efectivos. Preparación consulta el catálogo actual; partida consulta sus definiciones congeladas. Category general no contiene objetivos. Las partidas compatibles anteriores sin reglas generales continúan recuperándose.

CorrectionPreview entrega cambios por entrada, marcador y resultado proyectados. ContextId incluye ronda, jugador de turno y fase. Las confirmaciones conservan revisión objetivo. Las importaciones reciben identidad nueva para impedir que una pestaña obsoleta resulte válida tras restaurar una copia antigua.

El repositorio admite también una expectativa privada del snapshot JSON incompatible leído para su sustitución; ese dato no se exporta ni se presenta como partida validada. Pantallas diferencia el permiso de importar del permiso de crear o modificar.

Las entradas sin registrar permanecen durante la sesión. Consultar reglas, cambiar jugador y cerrar paneles las conservan; recargar no promete recuperar borradores. Actualizar exige aceptar su descarte cuando existan.

## Evidencia ejecutada

- 65 pruebas en 10 archivos: motor, catálogo, repositorio, sesión, PWA y UI. TDD aplicado a comportamientos; fallos comprobados antes de su implementación.
- Tipos, análisis estático y construcción de producción correctos.
- Siete recorridos Playwright en Chromium, sobre producción bajo /wh40kmissionlog/:
  1. Preparar, avanzar, registrar, consultar rival, recargar, completar cinco rondas y recuperar Resultado.
  2. Descargar recursos, recargar sin red, escribir y recuperar la misma partida sin red.
  3. Vista a 320 px sin overflow; cerrar reglas y devolver foco.
  4. Corregir, recargar, deshacer, descargar copia, rechazar inválida, validar/sustituir compatible y recargar.
  5. Conflicto entre dos pestañas: conservar revisión nueva, confirmar carga y continuar con el contexto almacenado.
  6. Actualización real del service worker: aplazar, aplicar expresamente y recuperar la puntuación guardada.
  7. Snapshot local con esquema incompatible: rechazar copia inválida, confirmar copia compatible, escribir y recuperar.

Las pruebas de actualización modifican temporalmente el archivo del service worker y lo restauran al terminar. Los recorridos usan perfiles de prueba separados; no cambian la partida de la pestaña de revisión de Iván.

Pantallas registra por separado la inspección visual, foco real, contrastes y tamaños 320/390/768/1280 en ESTADO-PANTALLAS.md. No se afirma una auditoría completa de accesibilidad.

## Pendientes

- Tácticas: agotamiento no resuelto por los textos consultados; mazo completo y sus acciones siguen pendientes. Las capacidades permanecen bloqueadas.
- Otras primarias y giros; cierre anticipado fuera del recorrido inicial. No se rellenan reglas por analogía.
- Revisión funcional del recorrido Asistente con Iván; lector de pantalla, teclado virtual y zoom real.
- Disponibilidad, configuración y despliegue de Pages para el repositorio privado; comprobar también la URL real publicada.
- No hay migraciones implícitas de esquemas desconocidos. La escritura de un registro adicional de trazabilidad en el MCP falló por su ruta autorizada; consultas y referencias permanecen en el MCP.

No se ha declarado terminado todo P2–P5. PLAN.md marca solo tareas integradas y comprobadas.
