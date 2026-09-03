using IncidentFlow.Api.Domain.Enums;

namespace IncidentFlow.Api.Contracts.Incidents;

public sealed record CreateIncidentRequest(
    string Title,
    string Description,
    IncidentPriority Priority,
    IncidentCategory Category);
