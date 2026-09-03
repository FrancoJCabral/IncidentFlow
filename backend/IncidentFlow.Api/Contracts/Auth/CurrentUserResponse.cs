using IncidentFlow.Api.Domain.Enums;

namespace IncidentFlow.Api.Contracts.Auth;

public sealed record CurrentUserResponse(Guid Id, string Email, UserRole Role);
