# Cobertura del catálogo

Paquete: Chapter Approved 2026–2027. Versión propia: 0.3.0. Verificación realizada mediante MCP; sus referencias permanecen allí.

| Identificador propio | Comportamiento implementado | Evidencia ejecutable |
| --- | --- | --- |
| general-preparation / general-fixed / general-scoring / general-ending | Consulta de preparación, permanencia de fijas, límites y final; snapshot congelado, sin objetivos | general-rules.test.ts |
| primary-dominance | Ventanas de rondas 1–2, control desde ronda 2 y momento de ronda 5; acumulación y límites | engine.test.ts, correction.test.ts |
| secondary-assassination | Fija; personajes y subconjunto H ≥ 4; final de cualquier turno | engine.test.ts, correction.test.ts |
| secondary-engage | Fija; presencia en 3/4 cuartos, condiciones excluyentes; final propio | engine.test.ts |
| secondary-grievous | Fija; 4 PV por unidad de efectivos iniciales 13 o más eliminada; final de cualquier turno | fixed-missions.test.ts |
| secondary-bringdown | Fija; 4 PV por miniatura con H de 10 o más eliminada; final de cualquier turno | fixed-missions.test.ts |

Reglas generales comprobadas para este recorrido: dos fijas distintas; permanencia y prohibición de descarte; giro opcional omitido; orden de juego aportado tras la tirada; cinco rondas incluso sin miniaturas; límites por ronda, partida y fija; preparado para la batalla y resultado.

La UI recoge hechos observados por el operador. No determina por sí sola presencia, control de objetivos, bajas o preparado para la batalla. Los máximos de los campos son límites del formato de datos, no reglas nuevas.

## Fuera de la cobertura inicial

No está habilitada la modalidad táctica. Se han consultado preparación, robo al inicio de mando, cambio una vez por batalla y descartes al final; faltan una política verificada de agotamiento y la implementación/cobertura del mazo completo. Los textos disponibles no permiten completar esa política por analogía.

Las demás primarias y los giros requieren incorporar y probar sus comportamientos. El cierre anticipado no se ofrece. La copia solo acepta el esquema 1 y fórmulas implementadas; no hay migraciones implícitas.

La escritura de un registro adicional de verificación dentro del MCP devuelve un error de ruta autorizada. Las consultas y referencias de verificación permanecen en las llamadas del MCP; no se han trasladado al proyecto. Este fallo no se presenta como ausencia de los textos consultados.
