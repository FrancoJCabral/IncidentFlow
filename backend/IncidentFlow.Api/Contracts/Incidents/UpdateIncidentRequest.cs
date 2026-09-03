using IncidentFlow.Api.Domain.Enums;

namespace IncidentFlow.Api.Contracts.Incidents;

public sealed record UpdateIncidentRequest(
    string Title,
    string Description,
    IncidentPriority Priority,
    IncidentCategory Category);
