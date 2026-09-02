# IncidentFlow

IncidentFlow es una aplicación web orientada a la gestión de incidencias internas de organizaciones. Permitirá registrar, priorizar, asignar, seguir y resolver incidencias desde una plataforma centralizada.

## Problema

En muchas organizaciones, las incidencias se gestionan de forma desorganizada mediante mensajes, correos electrónicos o herramientas desconectadas. Esto dificulta conocer las prioridades, identificar a los responsables y medir los tiempos de resolución.

## Solución

IncidentFlow centralizará el ciclo de vida completo de una incidencia, desde su creación y priorización hasta su asignación, seguimiento y resolución.

## Objetivo del proyecto

Este proyecto de portfolio está orientado a demostrar capacidades de desarrollo backend y frontend, arquitectura de software, persistencia de datos, autenticación, testing, cloud y aplicación de buenas prácticas.

## Stack

### Stack actual

- .NET 8
- ASP.NET Core Web API
- Swagger / OpenAPI

### Stack planificado

- Entity Framework Core
- PostgreSQL
- Next.js
- TypeScript
- JWT Authentication
- Role Based Access Control
- Docker
- GitHub Actions
- Testing

## Estado

Work in Progress.

## API actual

### `GET /api/health`

Respuesta:

```json
{
  "status": "ok"
}
```

## Ejecución local

Desde la raíz del repositorio, ejecutar:

```powershell
dotnet run --project .\backend\IncidentFlow.Api\IncidentFlow.Api.csproj --launch-profile https
```

Health:  
[https://localhost:7231/api/health](https://localhost:7231/api/health)

Swagger:  
[https://localhost:7231/swagger/index.html](https://localhost:7231/swagger/index.html)
