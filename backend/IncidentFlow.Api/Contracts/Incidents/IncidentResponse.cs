using IncidentFlow.Api.Domain.Enums;

namespace IncidentFlow.Api.Contracts.Incidents;

public sealed record IncidentResponse(
    Guid Id,
    string Title,
    string Description,
    IncidentPriority Priority,
    IncidentStatus Status,
    IncidentCategory Category,
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt,
    DateTimeOffset? ResolvedAt);
