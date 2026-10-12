# Análisis de misiones y estilos de ejército

Paquete: Chapter Approved 2026–2027. Análisis propio 1.0, 12 de octubre de 2026.

Se han leído en el MCP las 25 primarias, las 18 secundarias y los 6 giros disponibles, además de las reglas generales de selección, acciones, control y puntuación. La trazabilidad de las consultas permanece en el MCP. Este documento contiene síntesis e inferencias estratégicas, no un catálogo ejecutable ni una declaración de cobertura del motor.

La conclusión de trabajo es que una lista con presencia resistente, unidades independientes para tareas y capacidad de disputar posiciones tiene la adaptación más amplia. La rapidez, la resistencia o el daño por separado ofrecen ventajas fuertes en familias concretas, pero dejan huecos en otras. Esto es una inferencia del diseño de las misiones; no es una clasificación basada en resultados de torneos.

## Alcance y límites

- La primaria de cada jugador se determina cruzando su disposición de fuerza con la del oponente. Dos jugadores pueden tener primarias distintas.
- Los destacamentos dan acceso a disposiciones. No se ha verificado en este análisis la matriz completa disposición → rival → primaria ni el acceso de cada destacamento. No se asignan misiones a disposiciones por su nombre.
- Los recuentos siguientes describen las tarjetas consultadas. No representan probabilidades de encontrar una misión: dependen de las disposiciones y, en secundarias, de robos, permanencia y sustituciones.
- No se han comparado perfiles, costes, destacamentos o listas concretas de facciones. Las ventajas son cualitativas y dependen del terreno, despliegue, rival y orden de juego.
- Quedan por cerrar la preparación completa de algunos marcadores de operación, sus interacciones entre primarias y el agotamiento del mazo táctico. No se simulan puntuaciones esperadas usando políticas supuestas.
- Existen diferencias de redacción entre idiomas en algunos criterios. Para los ejemplos analíticos se ha contrastado el original inglés; los casos dudosos requieren resolución antes de automatizarse.

## Patrones generales

### 1. El control sostenido es transversal

Las 25 primarias incluyen alguna ventana de puntuación al final de mando. En muchas se desplaza al final del turno propio en la quinta ronda; Superar y despistar también cambia al final propio desde la cuarta.

Esto premia aguantar hasta la ventana de puntuación, conservar control y disponer de recambios. Llegar a un objetivo y morir en la respuesta rival no equivale a sostenerlo. El control depende de la suma de OC, no solo del número de unidades ni de su resistencia.

La resistencia útil es la que conserva puntuación: cuerpos, OC, protección y capacidad de reemplazar al ocupante. Un bloque muy resistente sin alcance para llegar al objetivo puede rendir peor que una unidad menos resistente que llega a tiempo.

### 2. Hay una demanda real de unidades para tareas

11 de las 25 primarias contienen acciones. En general, una unidad que inicia una acción pierde disparo y carga durante ese turno; avanzar o retirarse impide iniciarla. También hay restricciones por OC, acobardamiento, estar trabada y tipo de unidad.

Hay excepciones expresas: TITANIC puede iniciar acciones estando trabada y puede disparar tras iniciarlas; no recibe por ello una excepción general a la prohibición de cargar. Orgullo marcial permite a BATTLELINE iniciar una acción tras avanzar y disparar tras iniciarla.

Inferencia: las unidades baratas y autónomas pueden liberar a las unidades de combate de tareas que les cuestan su actividad ofensiva. Tener movimiento alto no basta si para llegar hay que avanzar y eso bloquea la acción.

Una misma unidad tampoco puede iniciar dos acciones en el mismo turno. Combinar una primaria de acción con Purificar o Arrasar y saquear exige repartir trabajo, o priorizar una de ellas.

### 3. Las bajas importan por el contexto y por unidades completas

12 primarias tienen criterios que mencionan directamente unidades eliminadas; Consagrar añade una dependencia de eliminar a través de su mecánica.

No todas premian matar más:
- Fuerza imparable concede 3 PV por eliminar al menos una unidad: el incentivo directo tiene un umbral.
- Retrasar concede 2 PV por cada unidad eliminada: hay un incentivo directo a varias bajas.
- Picadora e Ira del destructor comparan unidades enemigas eliminadas en el turno propio con unidades amigas eliminadas en el turno anterior.
- Purgar y asegurar atiende a la posición del atacante y de la víctima.
- Consagrar requiere que la unidad que ha eliminado llegue después a un objetivo válido.

Inferencia: una lista de muchas unidades pequeñas tiene facilidad para distribuirse, pero también puede regalar intercambios favorables por número de unidades. Las misiones no valoran necesariamente los puntos de ejército perdidos.

### 4. La retaguardia puede valer más que sus puntos directos

En Dominio del campo de batalla, desde la segunda ronda, cada objetivo controlado vale 3 PV y cada objetivo distinto del propio añade 2 PV si se conserva el propio.

Ejemplo de esa ventana: propio + dos exteriores = 13 PV. Perder el propio manteniendo los dos exteriores = 6 PV. La caída es de 7 PV: 3 directos y 4 de bonificación. No incluye el criterio separado de mayoría al final propio en las rondas 1–2 ni otros límites o puntos de ese turno.

Inferencia: una incursión barata que arrebata la retaguardia puede producir un efecto mayor que eliminar una unidad más cara en el centro. Defender el objetivo propio y negar accesos son parte de la economía de puntuación.

### 5. Algunas misiones acumulan trabajo y otras exigen repetirlo

Triangular y Humo y espejismos puntúan estados de objetivos ya marcados, mientras Sabotaje paga por acciones completadas en ese turno.

Triangular solo permite una acción por turno desde la segunda ronda. Su progresión nominal es 3 / 6 / 10 PV por tener uno / dos / tres o más objetivos triangulados. La prioridad es iniciar la secuencia a tiempo; disponer de cuatro unidades para acciones simultáneas no acelera su límite.

Reunir información permite acciones en varios objetivos distintos desde la segunda ronda y paga 7 PV por cada acción completada. Premia el despliegue simultáneo y adelantado, pero los límites pueden desperdiciar puntos nominales.

Estos estados deben leerse con la primaria rival: Vigilar al enemigo permite retirar marcadores rivales de un objetivo al terminar un movimiento dentro de su alcance. No se puede asumir que todo trabajo marcado sea irreversible.

### 6. La quinta ronda y el final de batalla importan

12 primarias contienen bonificaciones al final de batalla. Varias pagan por tomar el objetivo propio enemigo; otras por marcadores, cuatro objetivos o limpiar el territorio.

Inferencia: conservar una unidad capaz de llegar o disputar al final puede ser más valioso que comprometer todo el ejército en las primeras rondas. La ventaja del orden de juego requiere examinar cada ventana; no se deduce una ventaja universal para quien empieza o juega segundo.

### 7. Los máximos limitan el beneficio de concentrar recursos

Hay un máximo de 45 PV en primaria y 45 en secundaria, con 15 por ronda en cada categoría. Cada secundaria fija tiene un máximo de 20; dos fijas permiten, por tanto, un techo combinado de 40 frente a 45 en tácticas. Los 10 de preparado para la batalla son otra categoría.

Ejemplo: Reunir información puede generar nominalmente 4 de mando + 14 por dos acciones en una misma ronda; el máximo de primaria de esa ronda es 15. El trabajo adicional puede ayudar al bono final, pero no convierte esos 18 nominales en 18 anotados.

Inferencia: importa alcanzar el techo con fiabilidad y negar al rival, no maximizar cada criterio sin mirar los límites.

## Lectura específica de las 25 primarias

Las ventajas de esta tabla son inferencias a partir de los criterios, no reglas ni una predicción estadística.

| Primaria | Patrón verificado | Estilo con mejor encaje y principal condición |
| --- | --- | --- |
| Dominio del campo de batalla / Battlefield Dominance | Control por objetivo, bonificación exterior ligada al propio y mayoría temprana | Control repartido con retaguardia segura. Vulnerable a incursiones que corten la bonificación. |
| Consagrar / Consecrate | Eliminar con una unidad, llevarla a objetivos para consagrar y puntuar objetivos consagrados | Combate móvil y presencia avanzada. El daño remoto sin llegada del ejecutor encaja peor. |
| Trampa mortal / Death Trap | Acciones inmediatas en terrenos distintos; más puntos al minar objetivos y bajas en terrenos minados | Unidades distribuidas para tareas más daño. La ocupación del terreno y el número de zonas útiles condicionan el rendimiento. |
| Retrasar / Delaying Action | Puntos por cada baja, control no local y combinación central + expansión | Desgaste con presencia en dos tipos de objetivo. El daño desde retaguardia cubre solo parte de la misión. |
| Ira del destructor / Destroyer's Wrath | Una baja, mayoría de objetivos y balance favorable de bajas entre turnos | Combate eficiente con control. La mayoría vale 6 PV; no basta con hacer daño. |
| Adquisición determinada / Determined Acquisition | Objetivos recién tomados y bonificación de control en territorio rival | Movilidad con OC y presión ofensiva. Mantenerse estático pierde el premio por adquisición. |
| Extraer la reliquia / Extract Relic | Barrido central, bajas en objetivos y acceso a la zona del último marcador rival | Control central con alcance para incursiones. Encaje provisional hasta cerrar preparación e interacción de marcadores. |
| Reunir información / Gather Intel | Centro temprano, acciones simultáneas en objetivos sin marcador propio y bonos finales | Varias unidades para tareas y ocupación temprana. Los límites penalizan concentrar todo el trabajo en una ronda. |
| Objeto inamovible / Immovable Object | Centro al final propio y 5 PV por objetivo no propio en las ventanas de control | Anclas resistentes y recambios. Una lista con poca presencia simultánea deja puntos disponibles. |
| Dominación sin escape / Inescapable Dominion | Umbrales de dos y tres objetivos, mayoría y bono por el propio enemigo | Control amplio con OC. Una única concentración muy fuerte puede no alcanzar los umbrales. |
| Localizar y negar / Locate and Deny | Marcadores iniciales, barridos, bajas en objetivos y acceso al último marcador propio | Control central y maniobra. Su evaluación completa depende de quién puede retirar cada marcador. |
| Picadora / Meatgrinder | Una baja, control no propio, intercambio favorable y propio enemigo | Combate eficiente con pocas pérdidas de unidades y presión. Muchas unidades pequeñas expuestas complican el balance. |
| Superar y despistar / Outmanoeuvre | Propio enemigo por 10 PV; control no propio cambia de mando a final propio en rondas 4–5 | Movilidad y capacidad de llegar tarde. La resistencia pesa más en rondas 2–3 que en el tramo final. |
| Castigo / Punishment | Seleccionar condenadas; puntuar cuando abandonan el campo y mantener mayoría | Amenazas capaces de castigar unidades clave y disputar control. El criterio dice abandonar el campo, no solo eliminar. |
| Purgar y asegurar / Purge and Secure | Bajas desde objetivos y contra ocupantes; control y nuevas capturas | Combate sobre objetivos, asalto o disparo desde posiciones útiles. No favorece exclusivamente el cuerpo a cuerpo. |
| Pasada de reconocimiento / Reconnaissance Sweep | Presencia fuera del centro en tres o cuatro cuartos, bajas y control | Muchas unidades independientes móviles. Las bases y formaciones deben caber completamente en cada cuarto. |
| Sabotaje / Sabotage | Acciones repetibles en objetivos distintos, con premio en territorio enemigo | Unidades para tareas con OC y acceso ofensivo. El trabajo compite con disparo, carga y otras acciones. |
| Buscar y purgar / Search and Scour | Centro, bajas de unidades que empezaron en terreno, control y territorio limpio al final | Control central con daño y defensa frente a incursiones. Dejar una unidad enemiga en territorio puede negar el bono final. |
| Asegurar el activo / Secure Asset | Una acción por turno, bajas en objetivos centrales y umbral de tres objetivos | Lista combinada con unidad para tareas y control amplio. Una acción adicional no evita su límite por turno. |
| Humo y espejismos / Smoke and Mirrors | Marcar objetivos diferentes, puntuar el estado marcado y premio en territorio rival | Expansión temprana con varias unidades para tareas. Revisar la capacidad rival de retirar marcadores. |
| Vigilar al enemigo / Surveil the Foe | Acciones de vigilancia con visión a 18 pulgadas, mayoría y retirada de marcadores rivales mediante movimiento | Unidades de apoyo y movimiento para interferir con la misión rival. Su rendimiento depende de la pareja de primarias. |
| Triangular / Triangulation | Una acción por turno desde ronda 2, progresión de objetivos marcados y cuatro objetivos al final | Control progresivo y rotación de una unidad para tareas. Empezar tarde reduce la progresión. |
| Fuerza imparable / Unstoppable Force | Una baja, control no propio, nuevas capturas y centro final | Presión con capacidad de tomar objetivos después del combate. Matar sin ocupar deja criterios sin cumplir. |
| Operación de vanguardia / Vanguard Operation | Acción en terreno rival sin enemigos al completarla, una baja y propio enemigo al final | Incursiones y amenazas que abran zonas. Una pantalla enemiga puede bloquear la operación sin controlar un objetivo. |
| Vía vital / Vital Link | Control central, acción que acumula marcadores allí y bono final ofensivo | Ancla central resistente con unidad para tareas. Llegar pronto permite acumular más rendimiento. |

## Secundarias: cuatro familias con necesidades distintas

| Secundaria | Qué exige | Ventaja y coste estratégico |
| --- | --- | --- |
| Golpe brutal / A Grievous Blow | Eliminar unidades de efectivos iniciales 13 o más | Daño adecuado contra esas unidades. Depende de los blancos ofrecidos por el rival, no de que se le etiquete como horda. |
| Asesinato / Assassination | Eliminar personajes; en táctica también se contempla que todos estén eliminados durante la batalla | Acceso a personajes y capacidad de terminar bajas. Muchos personajes enemigos no garantizan que sean accesibles. |
| Derribadlo / Bring It Down | Eliminar miniaturas con H de 10 o más | Daño eficaz contra esos perfiles. La condición es H, no las palabras clave VEHÍCULO o MONSTRUO. |
| Sin prisioneros / No Prisoners | 2 PV por unidad eliminada, hasta 5 | Daño repartido que remata varias unidades. Una única baja grande no da el máximo. |
| Fuerza abrumadora / Overwhelming Force | 3 PV por unidad eliminada que empezó el turno en un objetivo, hasta 5 | Desalojar ocupantes. Hay que registrar dónde empezaron, no solo dónde mueren. |
| Luchar en todos los frentes / Engage On All Fronts | Presencia en tres o cuatro cuartos, fuera de las 6 pulgadas centrales | Unidades móviles independientes. Puede competir por posiciones con planes muy concentrados en el centro. |
| Tras las líneas enemigas / Behind Enemy Lines | 3 PV por unidad completamente en despliegue rival, hasta 5; excluidas aeronaves y acobardadas | Incursiones, reservas o movilidad si sus reglas permiten llegar. Las pantallas y el espacio disponible son decisivos. |
| Flanquear / Outflank | Bordes y presencia exterior; premio por bordes opuestos | Amenazas dispersas y movilidad lateral. No basta con avanzar todo por el centro. |
| Posiciones avanzadas / Forward Position | Propio enemigo y/o todos los objetivos de expansión | OC y capacidad de arrebatar varias posiciones. Depende de la geometría real de la mesa. |
| Terreno central / Centre Ground | Presencia propia central y ausencia enemiga a 3 o 6 pulgadas | Limpiar y ocupar el centro. Una pequeña unidad rival puede negar el tramo alto sin ganar el control de un objetivo. |
| Controlar la tierra de nadie / Secure No Man's Land | Dos objetivos en tierra de nadie | Dos ocupantes o una presencia amplia con control suficiente. |
| Un blanco ansiado / A Tempting Target | Tomar el objetivo de tierra de nadie elegido por el rival | Alcance y capacidad de desalojar. La ubicación no la elige quien intenta puntuar. |
| Purificar / Cleanse | Acción en uno o varios objetivos no propios; control al completar | Unidades para tareas: 2 PV por uno, 5 por dos o más. Renuncia ofensiva y necesidad de repartirse. |
| Arrasar y saquear / Plunder | Acción inmediata en terreno fuera del territorio propio | Unidad de incursión elegible para acciones. No exige la misma persistencia que una carta que puntúa tras el turno rival. |
| Baliza / Beacon | Unidad designada viva y fuera del despliegue o territorio propio tras la respuesta rival | Movilidad con supervivencia. Una unidad frágil enviada a morir no resuelve el criterio. |
| El peso de la confianza / Burden Of Trust | 2 PV por objetivo guardado por unidades designadas tras la respuesta rival, hasta 5 | Resistencia, OC y protección de ocupantes concretos. El reemplazo del guardián no se asume equivalente. |
| Defender bastión / Defend Stronghold | Propio controlado tras respuesta rival y premio por despliegue sin enemigos | Defensa de retaguardia y pantallas. No puntúa en primera ronda; existe sustitución al robarla entonces. |
| Muestra de poder / Display of Might | Más unidades que el rival completamente en tierra de nadie; 2 al final propio o 5 al final rival | Muchas unidades independientes con supervivencia. El criterio cuenta unidades, no miniaturas ni OC. |

La familia de permanencia incluye Baliza, El peso de la confianza, Defender bastión y el tramo alto de Muestra de poder. Es un error evaluar todas las secundarias como visitas al final del turno propio.

### Patrones específicos del mazo secundario

Si se agrupan por su criterio principal, cinco cartas dependen de bajas y trece de posición, control, acciones o permanencia. Es una clasificación analítica: no equivale a una probabilidad de robo ni significa que el daño sea innecesario para las otras trece.

La distribución propuesta es: cinco de bajas; tres de presencia geográfica (Luchar en todos los frentes, Tras las líneas enemigas, Flanquear); cuatro de ocupación o negación (Un blanco ansiado, Posiciones avanzadas, Terreno central, Controlar la tierra de nadie); dos de acciones (Purificar, Arrasar y saquear); tres de permanencia (Baliza, El peso de la confianza, Defender bastión); y una de mayoría por número de unidades (Muestra de poder), que también tiene un tramo de permanencia.

Varias cartas premian distribuirse hasta un umbral, sin premiar indefinidamente más recursos: dos unidades válidas alcanzan 5 PV en Tras las líneas enemigas; dos objetivos purificados dan 5; tres objetivos guardados alcanzan el máximo de 5 de El peso de la confianza. Son ejemplos de condiciones cumplidas con la carta activa, no una propuesta de reservar un número fijo de unidades para cualquier mesa.

Muestra de poder cuenta unidades, mientras que controlar objetivos depende de OC. Una horda reunida en un bloque no ofrece la misma ventaja que varias unidades separadas. Terreno central también se distingue del control: la presencia de una unidad enemiga dentro de la distancia indicada puede negar el criterio sin superar el OC del ocupante.

El efecto de la composición rival es doble. Muchas unidades pequeñas ofrecen blancos para Sin prisioneros; unidades de efectivos iniciales 13+ ofrecen Golpe brutal; miniaturas con H 10+ ofrecen Derribadlo; personajes ofrecen Asesinato. Esa exposición debe evaluarse junto con accesibilidad y resistencia: cumplir un perfil no garantiza regalar sus puntos.

Inferencia: una lista móvil con varias unidades independientes tiene cobertura amplia del mazo táctico, pero necesita ocupantes resistentes para permanencia y daño suficiente para desalojar. Una lista de élite puede compensar su menor distribución con pequeñas unidades de apoyo; una lista de disparo gana cobertura cuando mantiene herramientas para incursiones y acciones.

Purificar y Arrasar y saquear tienen sustitución al robar si la otra está activa. Tras las líneas enemigas y Posiciones avanzadas permiten sustitución en primera ronda. Golpe brutal y Derribadlo permiten sustituirse al robar cuando no existen los blancos indicados en el campo. Estas reglas hacen inadecuado modelar las 18 cartas como retos igualmente probables e igualmente obligatorios.

### Fijas frente a tácticas

Las cuatro fijas disponibles son Asesinato, Golpe brutal, Derribadlo y Luchar en todos los frentes. Se eligen dos distintas y permanecen activas; no se descartan.

- Golpe brutal y Derribadlo: 4 PV por blanco válido en fija; para alcanzar 20 hacen falta cinco bajas válidas, respetando límites y sin asumir que existan.
- Asesinato: 3 PV por personaje, más 1 si tiene H de 4 o más. Hay que calcular los blancos reales, su protección y cuándo se pueden alcanzar.
- Luchar en todos los frentes: 2 por tres cuartos o 4 por cuatro. Mantener solo tres cuartos durante cinco turnos da 10 PV; cuatro durante los cinco da 20. Son tramos alternativos.

Inferencia: las fijas son atractivas cuando la lista rival ofrece suficientes blancos accesibles y el plan propio ya produce esas bajas o posiciones. Ofrecen previsibilidad, pero obligan a combinar una misión de bajas con otra fija: no hay dos fijas puramente posicionales en este catálogo.

Las tácticas favorecen flexibilidad, disponibilidad de unidades para tareas y alcance. Se roban dos al inicio de mando según el texto consultado; existe un cambio una vez por batalla al final de mando por 1 PM. Se descartan al puntuarlas y se pueden descartar al final propio para ganar 1 PM. No se interpreta ese punto como uno por cada carta descartada, ni se inventa una regla de agotamiento.

## Comparación de arquetipos

| Arquetipo | Encaje más fuerte | Riesgo recurrente |
| --- | --- | --- |
| Lista combinada con anclas, tareas e incursiones | Adaptación amplia a control, acciones, respuesta táctica y negación | Necesita repartir recursos; puede perder una confrontación de daño contra una lista especializada. |
| Muchas unidades pequeñas móviles | Cuartos, bordes, acciones simultáneas, pantallas y varias posiciones | Bajas por número de unidades en Picadora/Ira del destructor; poca permanencia si son frágiles. |
| Horda con OC | Umbrales de control, ocupación y tareas si las unidades son elegibles | Exposición a Golpe brutal cuando las unidades cumplen 13+ y dificultad geométrica para estar completamente dentro de zonas. |
| Bloques resistentes de élite | Objeto inamovible, Vía vital y secundarias tras respuesta rival | Pocas unidades autónomas; una acción puede consumir una parte importante del daño. |
| Asalto móvil | Consagrar, Purgar y asegurar, Fuerza imparable y toma ofensiva | Acciones impiden cargar; hace falta una segunda capa de unidades para tareas y retaguardia. |
| Disparo con apoyo móvil | Retrasar, eliminación de ocupantes y defensa de objetivos | Quedarse atrás pierde control. Consagrar exige mover a quien elimina; Combate nocturno reduce el alcance práctico. |
| Vehículos o monstruos con pocas unidades | Resistencia y daño para dominar posiciones concretas | Cobertura simultánea, terreno, tareas y blancos de H 10+ para Derribadlo. TITANIC introduce excepciones relevantes. |
| Incursiones y reservas | Retaguardia, cuartos, bordes y operaciones en territorio rival | Pantallas, reglas reales de llegada y tiempo de entrada; llegar tarde no recupera puntuación temprana perdida. |

No hay una superioridad universal entre muchas unidades pequeñas y bloques grandes. La primera gana distribución; los segundos pueden negar bajas y conservar control. El rival y las dos primarias deciden qué intercambio conviene.

## Los seis giros pueden cambiar el diagnóstico

| Giro | Efecto verificado | Inferencia estratégica |
| --- | --- | --- |
| Orgullo marcial / Martial Pride | BATTLELINE puede iniciar acciones tras avanzar y disparar tras iniciarlas | Mejora la eficiencia de listas que usan esa tropa para tareas. No concede permiso de cargar tras la acción. |
| Mundo espejo / Mirrored World | Ambos sustituyen su primaria por una común entre cinco opciones | Elimina la diferencia de primaria de esa partida; la misión común elegida determina la ventaja. |
| Combate nocturno / Night Fighting | Visibilidad y ataques indirectos limitados a 18 pulgadas según el texto | Favorece aproximación y combate corto; reduce el valor del alcance largo. No garantiza ventaja a todo ejército de asalto. |
| No hay donde esconderse / Nowhere to Hide | El terreno pierde Solid | Aumenta oportunidades de visión por huecos; favorece daño a distancia donde haya líneas reales. No elimina automáticamente todas las coberturas. |
| Paraje en ruinas / Ruinscape | MOBILE durante movimientos normales y avances | Facilita atravesar horizontalmente terreno denso a modelos que antes tenían restricciones; beneficia especialmente a grandes modelos limitados por rutas. No extiende el efecto a cargas. |
| Comunicaciones interrumpidas / Scrambled Communications | Los jugadores intercambian primarias | Puede romper el ajuste entre ejército y misión. Hay que volver a evaluar ambas capacidades y la negación. |

## Hipótesis para contrastar en mesa

1. La ventaja más transversal pertenece a listas que pueden sostener objetivos y reservar unidades independientes para tareas.
2. Las listas muy móviles obtienen más de su ventaja cuando puntúan al final propio; necesitan resistencia adicional para cartas de permanencia.
3. El daño convierte mejor en puntos cuando limpia posiciones y permite ocuparlas. Su valor disminuye al alcanzar umbrales o máximos.
4. Las incursiones a retaguardia pueden afectar a primaria, secundarias y bonificaciones a la vez.
5. El número de unidades es una variable de doble efecto: capacidad de distribuir tareas y riesgo de regalar bajas o balances favorables.
6. Elegir fijas requiere contar blancos accesibles y comprobar la segunda misión; la etiqueta de la facción rival no basta.
7. No puede afirmarse qué disposición es mejor sin su matriz completa y sin evaluar las misiones que deja al adversario.

Para comparar listas concretas, registrar: ocupantes con OC; supervivencia hasta mando; unidades elegibles para acciones sin avanzar; cuartos/bordes alcanzables; presión sobre retaguardia; capacidad de eliminar ocupantes y personajes; blancos válidos que ofrece cada lista; y recursos que conserva para rondas 4–5. Después evaluar la primaria propia y la rival, las secundarias y el giro bajo un despliegue y terreno concretos.

La comparación debería estimar puntos propios y puntos rivales negados por ronda, con escenarios conservador, habitual y favorable. Sin listas ni partidas observadas, asignar porcentajes de victoria o una nota numérica a facciones daría una precisión que este análisis no sostiene.
