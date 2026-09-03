using System.ComponentModel.DataAnnotations;
using IncidentFlow.Api.Domain.Enums;

namespace IncidentFlow.Api.Contracts.Incidents;

public sealed record CreateIncidentRequest(
    [Required, MaxLength(200)] string Title,
    [Required, MaxLength(4000)] string Description,
    IncidentPriority Priority,
    IncidentCategory Category);
