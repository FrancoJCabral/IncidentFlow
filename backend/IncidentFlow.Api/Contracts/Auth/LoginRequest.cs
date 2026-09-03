using System.ComponentModel.DataAnnotations;

namespace IncidentFlow.Api.Contracts.Auth;

public sealed record LoginRequest(
    [Required, EmailAddress, MaxLength(320)] string Email,
    [Required, MinLength(8), MaxLength(128)] string Password);
