using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using IncidentFlow.Api.Contracts.Auth;
using IncidentFlow.Api.Domain.Entities;
using IncidentFlow.Api.Domain.Enums;
using IncidentFlow.Api.Infrastructure.Authentication;
using IncidentFlow.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IncidentFlow.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    IncidentFlowDbContext dbContext,
    IPasswordHasher<User> passwordHasher,
    JwtTokenService jwtTokenService) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(
        RegisterRequest request,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = global::IncidentFlow.Api.Domain.Entities.User.NormalizeEmail(request.Email);
        var alreadyExists = await dbContext.Users
            .AnyAsync(user => user.Email == normalizedEmail, cancellationToken);

        if (alreadyExists)
        {
            return Problem(
                type: "about:blank",
                title: "Email already registered",
                detail: "An account with this email already exists.",
                statusCode: StatusCodes.Status409Conflict);
        }

        var passwordHash = passwordHasher.HashPassword(null!, request.Password);
        var user = new User(normalizedEmail, passwordHash, UserRole.Operator);

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);

        var response = CreateAuthResponse(user);
        return Created("/api/auth/me", response);
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = global::IncidentFlow.Api.Domain.Entities.User.NormalizeEmail(request.Email);
        var user = await dbContext.Users
            .FirstOrDefaultAsync(user => user.Email == normalizedEmail, cancellationToken);

        if (user is null ||
            passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password) ==
            PasswordVerificationResult.Failed)
        {
            return Problem(
                type: "about:blank",
                title: "Unauthorized",
                detail: "Invalid email or password.",
                statusCode: StatusCodes.Status401Unauthorized);
        }

        return Ok(CreateAuthResponse(user));
    }

    [Authorize]
    [HttpGet("me")]
    public ActionResult<CurrentUserResponse> Me()
    {
        var idValue = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var email = User.FindFirstValue(JwtRegisteredClaimNames.Email);
        var roleValue = User.FindFirstValue("role");

        if (!Guid.TryParse(idValue, out var id) ||
            string.IsNullOrWhiteSpace(email) ||
            !Enum.TryParse<UserRole>(roleValue, out var role))
        {
            return Unauthorized();
        }

        return Ok(new CurrentUserResponse(id, email, role));
    }

    private AuthResponse CreateAuthResponse(User user)
    {
        var token = jwtTokenService.Generate(user);
        return new AuthResponse(
            token.AccessToken,
            token.ExpiresAt,
            new CurrentUserResponse(user.Id, user.Email, user.Role));
    }
}
