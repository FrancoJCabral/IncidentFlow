using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using IncidentFlow.Api.Contracts.Auth;
using IncidentFlow.Api.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Xunit;

namespace IncidentFlow.Api.Tests;

public class AuthApiTests : IClassFixture<CustomWebApplicationFactory>
{
    private const string ValidPassword = "SecurePassword123!";
    private const string TestIssuer = "IncidentFlow.Tests";
    private const string TestAudience = "IncidentFlow.Api.Tests";
    private const string TestSigningKey =
        "integration-tests-only-signing-key-at-least-32-bytes-long";
    private static readonly JsonSerializerOptions JsonOptions = CreateJsonOptions();
    private readonly CustomWebApplicationFactory factory;
    private readonly HttpClient client;

    public AuthApiTests(CustomWebApplicationFactory factory)
    {
        this.factory = factory;
        client = factory.CreateClient();
    }

    [Fact]
    public async Task Register_WithValidRequest_ReturnsCreated()
    {
        var response = await RegisterAsync(NewEmail());

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task Register_AssignsOperatorRole()
    {
        var auth = await RegisterAndReadAsync(NewEmail());

        Assert.Equal(UserRole.Operator, auth.User.Role);
    }

    [Fact]
    public async Task Register_NormalizesEmail()
    {
        var email = $"  USER-{Guid.NewGuid():N}@EXAMPLE.COM  ";

        var auth = await RegisterAndReadAsync(email);

        Assert.Equal(email.Trim().ToLowerInvariant(), auth.User.Email);
    }

    [Fact]
    public async Task Register_DoesNotReturnPasswordHash()
    {
        var response = await RegisterAsync(NewEmail());
        var json = await response.Content.ReadAsStringAsync();

        Assert.DoesNotContain("passwordHash", json, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain(ValidPassword, json);
    }

    [Fact]
    public async Task Register_StoresHashInsteadOfPlainPassword()
    {
        var email = NewEmail();
        await RegisterAndReadAsync(email);

        var storedHash = await factory.GetStoredPasswordHashAsync(email);

        Assert.False(string.IsNullOrWhiteSpace(storedHash));
        Assert.NotEqual(ValidPassword, storedHash);
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ReturnsConflictProblemDetails()
    {
        var email = NewEmail();
        await RegisterAndReadAsync(email);

        var response = await RegisterAsync(email.ToUpperInvariant());
        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal("Email already registered", problem?.Title);
    }

    [Fact]
    public async Task Register_WithShortPassword_ReturnsBadRequest()
    {
        var response = await client.PostAsJsonAsync(
            "/api/auth/register",
            new { email = NewEmail(), password = "short" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Register_WithInvalidEmail_ReturnsBadRequest()
    {
        var response = await client.PostAsJsonAsync(
            "/api/auth/register",
            new { email = "not-an-email", password = ValidPassword });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsOk()
    {
        var email = NewEmail();
        await RegisterAndReadAsync(email);

        var response = await LoginAsync(email, ValidPassword);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsJwt()
    {
        var email = NewEmail();
        await RegisterAndReadAsync(email);

        var auth = await LoginAndReadAsync(email, ValidPassword);

        Assert.False(string.IsNullOrWhiteSpace(auth.AccessToken));
        Assert.True(auth.ExpiresAt > DateTimeOffset.UtcNow);
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsUnauthorized()
    {
        var email = NewEmail();
        await RegisterAndReadAsync(email);

        var response = await LoginAsync(email, "WrongPassword123!");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithUnknownEmail_ReturnsUnauthorized()
    {
        var response = await LoginAsync(NewEmail(), ValidPassword);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task LoginFailures_UseSameGenericMessage()
    {
        var email = NewEmail();
        await RegisterAndReadAsync(email);

        var wrongPassword = await LoginAsync(email, "WrongPassword123!");
        var unknownEmail = await LoginAsync(NewEmail(), ValidPassword);
        var firstProblem = await wrongPassword.Content.ReadFromJsonAsync<ProblemDetails>();
        var secondProblem = await unknownEmail.Content.ReadFromJsonAsync<ProblemDetails>();

        Assert.Equal("Invalid email or password.", firstProblem?.Detail);
        Assert.Equal(firstProblem?.Detail, secondProblem?.Detail);
    }

    [Fact]
    public async Task Me_WithoutToken_ReturnsUnauthorized()
    {
        var response = await client.GetAsync("/api/auth/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Me_WithValidToken_ReturnsCurrentUser()
    {
        var auth = await RegisterAndReadAsync(NewEmail());
        Authenticate(auth.AccessToken);

        var response = await client.GetAsync("/api/auth/me");
        var currentUser = await response.Content.ReadFromJsonAsync<CurrentUserResponse>(JsonOptions);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(auth.User, currentUser);
    }

    [Fact]
    public async Task Incidents_WithoutToken_ReturnsUnauthorized()
    {
        var response = await client.GetAsync("/api/incidents");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Incidents_WithInvalidToken_ReturnsUnauthorized()
    {
        Authenticate("not-a-valid-jwt");

        var response = await client.GetAsync("/api/incidents");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Incidents_WithValidToken_ReturnsOk()
    {
        var auth = await RegisterAndReadAsync(NewEmail());
        Authenticate(auth.AccessToken);

        var response = await client.GetAsync("/api/incidents");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Incidents_WithUnauthorizedRole_ReturnsForbidden()
    {
        Authenticate(CreateTokenWithRole("Viewer"));

        var response = await client.GetAsync("/api/incidents");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Health_WithoutToken_ReturnsOk()
    {
        var response = await client.GetAsync("/api/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Jwt_ContainsOperatorRoleClaim()
    {
        var auth = await RegisterAndReadAsync(NewEmail());
        var token = new JwtSecurityTokenHandler().ReadJwtToken(auth.AccessToken);

        Assert.Contains(token.Claims, claim =>
            claim.Type == "role" && claim.Value == UserRole.Operator.ToString());
    }

    [Fact]
    public async Task PublicAuthContracts_NeverSerializePasswordHash()
    {
        var email = NewEmail();
        var register = await RegisterAsync(email);
        var login = await LoginAsync(email, ValidPassword);
        var combinedJson =
            await register.Content.ReadAsStringAsync() +
            await login.Content.ReadAsStringAsync();

        Assert.DoesNotContain("password", combinedJson, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain(ValidPassword, combinedJson);
    }

    private async Task<HttpResponseMessage> RegisterAsync(string email) =>
        await client.PostAsJsonAsync(
            "/api/auth/register",
            new { email, password = ValidPassword });

    private async Task<AuthResponse> RegisterAndReadAsync(string email)
    {
        var response = await RegisterAsync(email);
        response.EnsureSuccessStatusCode();
        return await ReadAuthResponseAsync(response);
    }

    private async Task<HttpResponseMessage> LoginAsync(string email, string password) =>
        await client.PostAsJsonAsync("/api/auth/login", new { email, password });

    private async Task<AuthResponse> LoginAndReadAsync(string email, string password)
    {
        var response = await LoginAsync(email, password);
        response.EnsureSuccessStatusCode();
        return await ReadAuthResponseAsync(response);
    }

    private static async Task<AuthResponse> ReadAuthResponseAsync(HttpResponseMessage response)
    {
        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>(JsonOptions);
        return Assert.IsType<AuthResponse>(auth);
    }

    private static JsonSerializerOptions CreateJsonOptions()
    {
        var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        options.Converters.Add(new JsonStringEnumConverter());
        return options;
    }

    private void Authenticate(string accessToken)
    {
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", accessToken);
    }

    private static string CreateTokenWithRole(string role)
    {
        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(TestSigningKey)),
            SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            TestIssuer,
            TestAudience,
            [
                new Claim(JwtRegisteredClaimNames.Sub, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Email, NewEmail()),
                new Claim("role", role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            ],
            expires: DateTime.UtcNow.AddMinutes(5),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string NewEmail() => $"user-{Guid.NewGuid():N}@example.com";
}
