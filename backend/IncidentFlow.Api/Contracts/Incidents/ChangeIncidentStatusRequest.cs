using IncidentFlow.Api.Domain.Enums;

namespace IncidentFlow.Api.Contracts.Incidents;

public sealed record ChangeIncidentStatusRequest(IncidentStatus Status);
