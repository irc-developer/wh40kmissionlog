# Terminal de misión

Web para que un operador lleve ambos jugadores de una partida de Warhammer 40K desde un dispositivo. Conserva una partida local, sus reglas, puntos y última operación reversible.

La primera cobertura jugable usa Chapter Approved 2026–2027, Dominio del campo de batalla y secundarias fijas. Las capacidades pendientes aparecen bloqueadas. Consulta [la cobertura](docs/COBERTURA-CATALOGO.md) antes de usar otras combinaciones.

## Desarrollo local

Requiere Node.js 24. Instala dependencias con `npm ci` y arranca con `npm run dev`. Abre la dirección local indicada. Los borradores sin registrar se conservan durante la sesión; solo las acciones aceptadas y escritas sobreviven a la recarga.

Comprobaciones: `npm test`, `npm run typecheck`, `npm run lint` y `npm run build`. Para los recorridos en navegador, instala Chromium con `npx playwright install chromium`, construye bajo la subruta y ejecuta `npm run test:e2e`. En PowerShell:

```powershell
$env:PAGES_BASE='/wh40kmissionlog/'
npm run build
npm run test:e2e
```

## Guardado y copias

«Guardado» confirma una escritura completa en este dispositivo. Si falla, reintentar guarda el mismo candidato. La copia exportada contiene reglas y reversión; una copia de cambios pendientes se identifica como tal. Una importación inválida conserva la partida actual. Si la partida local tiene un esquema incompatible, una copia compatible puede sustituirla tras confirmar y comprobar que el dato almacenado sigue siendo el mismo. Al importar una copia válida se conserva su contenido con una identidad propia nueva para evitar conflictos con pestañas antiguas.

No se guardan partidas en un servidor. El almacenamiento depende del navegador y de su perfil; la copia descargada permite trasladar la partida.

## Uso sin conexión y publicación

La construcción de producción empaqueta código, estilos, icono y catálogo. «Lista para usar sin conexión» se muestra tras comprobar sus recursos. Las actualizaciones se ofrecen para aplicar expresamente con el guardado resuelto.

GitHub Pages está preparado con ejecución manual. Repositorio privado: [irc-developer/wh40kmissionlog](https://github.com/irc-developer/wh40kmissionlog), conectado a la rama `main`. La publicación de la web sigue pendiente de comprobar la disponibilidad de Pages para este repositorio privado y configurar su despliegue. `PAGES_BASE` debe coincidir con la ruta real, incluida la barra inicial y final. La comprobación local utiliza una subruta de ensayo.

El recorrido funcional de la variante Asistente sigue pendiente de revisión con Iván. Historial y estadísticas quedan para otra fase.
