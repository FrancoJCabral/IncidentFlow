# Modelo de dominio del MVP

Este documento define el alcance funcional inicial de IncidentFlow. El modelo es conceptual: en esta etapa no establece una implementación técnica, un esquema de persistencia ni contratos definitivos de API.

## Incident

Una incidencia representa un problema, error, interrupción o situación que requiere seguimiento dentro de una organización.

| Propiedad | Propósito |
| --- | --- |
| `Id` | Identifica de manera única a la incidencia dentro del sistema. |
| `Title` | Resume el problema de forma breve y permite reconocer rápidamente la incidencia. |
| `Description` | Describe el problema, su contexto y la información necesaria para comprenderlo y darle seguimiento. |
| `Priority` | Indica el nivel de urgencia e impacto de la incidencia y ayuda a ordenar su atención. |
| `Status` | Representa la etapa actual de la incidencia dentro de su ciclo de vida. |
| `Category` | Clasifica la naturaleza de la incidencia para facilitar su organización y análisis. |
| `CreatedAt` | Registra automáticamente el momento en que se creó la incidencia. |
| `UpdatedAt` | Registra el momento de la modificación más reciente de la incidencia. |
| `ResolvedAt` | Registra el momento en que la incidencia alcanzó el estado `Resolved`. No tiene valor mientras la incidencia no esté resuelta y se limpia si el problema reaparece. |

Los timestamps se expresarán en UTC para mantener una referencia temporal consistente e independiente de la ubicación de los usuarios o de la infraestructura.

## Priority

La prioridad combina la urgencia y el impacto de una incidencia para orientar el orden de atención.

- `Low`: corresponde a problemas menores, sin impacto relevante en la operación y que pueden atenderse sin urgencia.
- `Medium`: corresponde a problemas con impacto limitado que afectan parcialmente el trabajo, pero permiten continuar operando.
- `High`: corresponde a problemas importantes que afectan significativamente la operación o a varios usuarios y requieren atención prioritaria.
- `Critical`: corresponde a interrupciones graves, riesgos de seguridad o problemas que impiden una operación esencial y requieren atención inmediata.

## Status

- `Open`: la incidencia fue registrada y está pendiente de comenzar a ser atendida.
- `InProgress`: la incidencia está siendo analizada o se está trabajando activamente en su resolución.
- `Resolved`: se aplicó una solución y el problema se considera resuelto, aunque todavía puede requerir validación antes del cierre definitivo.
- `Closed`: la resolución fue confirmada y la incidencia quedó cerrada definitivamente.

### Flujo de estados permitido

```text
Open
  ↓
InProgress
  ↓
Resolved
  ↓
Closed
```

Si el problema reaparece antes del cierre definitivo, una incidencia en estado `Resolved` puede volver a `InProgress`:

```text
Resolved → InProgress
```

No se contemplan otras transiciones para el MVP. En particular, `Closed` es un estado terminal y no puede reabrirse.

## Category

- `Software`: errores o comportamientos incorrectos en aplicaciones, sistemas operativos u otro software.
- `Hardware`: fallas o problemas relacionados con equipos y componentes físicos.
- `Network`: problemas de conectividad, disponibilidad o rendimiento de redes y servicios asociados.
- `Access`: dificultades para acceder a sistemas, recursos o permisos necesarios, sin incluir todavía la gestión de usuarios o roles.
- `Security`: eventos, riesgos o comportamientos que puedan comprometer la confidencialidad, integridad o disponibilidad de los sistemas y la información.
- `Other`: incidencias que no encajan adecuadamente en las categorías anteriores.

## Reglas de negocio iniciales

1. Toda incidencia debe tener título.
2. Toda incidencia debe tener descripción.
3. Toda incidencia debe tener prioridad.
4. Toda incidencia debe tener categoría.
5. Una incidencia nueva comienza en estado `Open`.
6. `CreatedAt` debe generarse automáticamente al crear la incidencia.
7. `UpdatedAt` debe actualizarse automáticamente cada vez que la incidencia sea modificada.
8. `ResolvedAt` debe establecerse automáticamente cuando la incidencia llegue al estado `Resolved` y no debe tener valor antes de esa transición.
9. Si una incidencia en estado `Resolved` vuelve a `InProgress`, `ResolvedAt` debe volver a `null`.
10. Al pasar de `Resolved` a `Closed`, `ResolvedAt` conserva la fecha en que se resolvió la incidencia.
11. Una incidencia en estado `Closed` representa el cierre definitivo y no admite nuevas transiciones dentro del MVP.

## Fuera del alcance actual

En esta etapa todavía no se implementarán:

- Usuarios
- Responsables
- Autenticación
- Roles
- Comentarios
- Archivos adjuntos
- SLA
- Notificaciones
- Auditoría
- Frontend

Estos elementos podrán agregarse posteriormente en futuras etapas del proyecto.
