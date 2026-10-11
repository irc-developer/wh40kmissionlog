# Instrucciones del proyecto

## Colaboración

- El usuario se llama Iván. Usar su nombre con naturalidad, sin repetirlo innecesariamente.
- Aplicar esta preferencia en resúmenes y coordinación; escribir «Nueva instrucción de Iván».
- Evitar «humano», «el humano» e «instrucción humana» al referirse a Iván.
- El plan, reparto y criterios de aceptación se encuentran en PLAN.md. Actualizar sus estados a partir de trabajo verificado.
- Antes de trabajar en paralelo, acordar contratos, responsables y archivos. Coordinar cambios de contratos compartidos para evitar implementaciones incompatibles.

## Alcance acordado

- Web mobile first con estética de terminal táctico para puntuar partidas de Warhammer 40K.
- Un operador controla a ambos jugadores desde un dispositivo.
- Secundarias gestionadas mediante mazos digitales, sin cartas físicas.
- Guardado automático y recuperación de la partida en curso, correcciones y deshacer.
- Historial de partidas y estadísticas quedan para una fase futura.
- React, TypeScript, Vite, CSS propio, IndexedDB con Dexie, vite-plugin-pwa y publicación en GitHub Pages mediante GitHub Actions.
- El boceto ha sido aprobado visualmente. La variante Asistente es la base propuesta, pendiente de validar el recorrido funcional con Iván.

## Clean code y TDD

- Para cambios de comportamiento, aplicar rojo → verde → refactorizar: escribir la prueba, comprobar que falla por el comportamiento ausente, implementar y refactorizar con pruebas en verde.
- Probar resultados y comportamientos observables. Evitar pruebas que reproduzcan la implementación o dependan de detalles internos innecesarios.
- Separar el motor de partida de React, almacenamiento y navegador. El motor debe poder probarse como TypeScript puro.
- Mantener responsabilidades concretas, nombres claros y dependencias justificadas. Crear abstracciones a partir de necesidades reales.
- La interfaz representa el estado y las acciones permitidas por el motor; no duplica reglas ni cálculos.
- Centralizar cambios de la partida para mantener coherentes puntuaciones, mazos, correcciones y deshacer.
- Validar datos del catálogo e importaciones en tiempo de ejecución; TypeScript no sustituye esta validación.
- Ejecutar las comprobaciones pertinentes: pruebas, tipos, análisis estático y construcción. Probar recorridos críticos en navegador.
- Para documentación, configuración y presentación, utilizar comprobaciones apropiadas sin inventar pruebas redundantes.

## Fuentes de reglas

- Consultar el MCP warhammerwiki como fuente del catálogo y de las reglas disponibles.
- Para Chapter Approved 2026–2027, consultar el catálogo y las tarjetas de misiones disponibles en el MCP. Verificar también las reglas generales que gobiernan la partida y los mazos.
- Mantener la trazabilidad de la verificación en el MCP. Usar identificadores propios y una versión propia para el catálogo incorporado al proyecto.
- No establecer reglas a partir de nombres o metadatos ni completar lagunas con otras ediciones o traducciones inventadas.
- Los campos ausentes siguen pendientes. Un comportamiento pendiente no se considera implementado ni validado.
- Los ejemplos del boceto no constituyen un motor de reglas ni una partida real.

## Presentación y datos publicados

- Por indicación de Iván, no incluir referencias a la aplicación de origen en la interfaz, documentación del proyecto, catálogo distribuido, exportaciones ni archivos publicados.
- No incorporar su nombre, versiones, enlaces, identificadores técnicos de origen, tablas, huellas ni metadatos de extracción a los entregables.
- La verificación de reglas continúa mediante el MCP; sus referencias de origen permanecen allí, fuera de los entregables del proyecto.
- Identificar el paquete de misiones del juego y la versión propia de nuestro catálogo cuando resulte útil para la partida.

## Fiabilidad

- Guardar el estado coherente de la partida tras cada acción aceptada; indicar «guardado» solo al completarse la escritura.
- Recuperar conserva los mazos y resultados de los robos; no vuelve a barajar la partida.
- La partida conserva las definiciones y versión de reglas necesarias para continuar tras actualizar el catálogo.
- No recargar automáticamente la aplicación por una actualización durante una partida.
- Empaquetar los recursos necesarios para uso sin conexión y probar la construcción bajo la ruta del repositorio en GitHub Pages.
