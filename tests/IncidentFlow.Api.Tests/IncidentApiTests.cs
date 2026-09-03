using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace IncidentFlow.Api.Tests;

public class IncidentApiTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient client;

    public IncidentApiTests(CustomWebApplicationFactory factory)
    {
        client = factory.CreateClient();
    }

    [Fact]
    public async Task Create_WithEmptyTitle_ReturnsValidationProblemDetails()
    {
        var response = await PostIncidentAsync(title: string.Empty);

        var problem = await ReadValidationProblemAsync(response);
        Assert.Contains("Title", problem.Errors.Keys);
    }

    [Fact]
    public async Task Create_WithEmptyDescription_ReturnsValidationProblemDetails()
    {
        var response = await PostIncidentAsync(description: string.Empty);

        var problem = await ReadValidationProblemAsync(response);
        Assert.Contains("Description", problem.Errors.Keys);
    }

    [Fact]
    public async Task Create_WithTitleLongerThanMaximum_ReturnsValidationProblemDetails()
    {
        var response = await PostIncidentAsync(title: new string('T', 201));

        var problem = await ReadValidationProblemAsync(response);
        Assert.Contains("Title", problem.Errors.Keys);
    }

    [Fact]
    public async Task Create_WithDescriptionLongerThanMaximum_ReturnsValidationProblemDetails()
    {
        var response = await PostIncidentAsync(description: new string('D', 4001));

        var problem = await ReadValidationProblemAsync(response);
        Assert.Contains("Description", problem.Errors.Keys);
    }

    [Fact]
    public async Task Create_WithInvalidEnum_ReturnsValidationProblemDetails()
    {
        const string json = """
            {
              "title": "Valid title",
              "description": "Valid description",
              "priority": "NotARealPriority",
              "category": "Software"
            }
            """;

        var response = await client.PostAsync(
            "/api/incidents",
            new StringContent(json, Encoding.UTF8, "application/json"));

        var problem = await ReadValidationProblemAsync(response);
        Assert.NotEmpty(problem.Errors);
    }

    [Fact]
    public async Task Create_WithNumericEnum_ReturnsValidationProblemDetails()
    {
        const string json = """
            {
              "title": "Valid title",
              "description": "Valid description",
              "priority": 3,
              "category": "Software"
            }
            """;

        var response = await client.PostAsync(
            "/api/incidents",
            new StringContent(json, Encoding.UTF8, "application/json"));

        var problem = await ReadValidationProblemAsync(response);
        Assert.NotEmpty(problem.Errors);
    }

    [Fact]
    public async Task Create_WithMalformedJson_ReturnsValidationProblemDetails()
    {
        var response = await client.PostAsync(
            "/api/incidents",
            new StringContent("{", Encoding.UTF8, "application/json"));

        var problem = await ReadValidationProblemAsync(response);
        Assert.NotEmpty(problem.Errors);
    }

    [Fact]
    public async Task GetById_WithUnknownId_ReturnsNotFound()
    {
        var response = await client.GetAsync($"/api/incidents/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task ChangeStatus_WithInvalidTransition_ReturnsInvalidOperationProblemDetails()
    {
        var incidentId = await CreateValidIncidentAsync();

        var response = await client.PatchAsJsonAsync(
            $"/api/incidents/{incidentId}/status",
            new { status = "Resolved" });

        var problem = await ReadProblemAsync(response, HttpStatusCode.BadRequest);
        Assert.Equal("Invalid operation", problem.Title);
        Assert.Contains("not allowed", problem.Detail);
    }

    [Fact]
    public async Task Create_WithWhitespaceTitle_ReturnsValidationProblemDetails()
    {
        var response = await PostIncidentAsync(title: "   ");

        var problem = await ReadValidationProblemAsync(response);
        Assert.Contains("Title", problem.Errors.Keys);
    }

    [Fact]
    public async Task Health_ReturnsOk()
    {
        var response = await client.GetAsync("/api/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task UnexpectedException_ReturnsGenericProblemDetails()
    {
        using var factory = new UnexpectedExceptionWebApplicationFactory();
        using var throwingClient = factory.CreateClient();

        var response = await throwingClient.PostAsJsonAsync(
            "/api/incidents",
            ValidIncidentRequest());

        var problem = await ReadProblemAsync(
            response,
            HttpStatusCode.InternalServerError);
        Assert.Equal("An unexpected error occurred", problem.Title);
        Assert.DoesNotContain("Sensitive database failure", problem.Detail);
    }

    private async Task<HttpResponseMessage> PostIncidentAsync(
        string title = "Valid title",
        string description = "Valid description")
    {
        return await client.PostAsJsonAsync(
            "/api/incidents",
            ValidIncidentRequest(title, description));
    }

    private async Task<Guid> CreateValidIncidentAsync()
    {
        var response = await PostIncidentAsync();
        response.EnsureSuccessStatusCode();

        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return document.RootElement.GetProperty("id").GetGuid();
    }

    private static object ValidIncidentRequest(
        string title = "Valid title",
        string description = "Valid description") => new
        {
            title,
            description,
            priority = "High",
            category = "Software"
        };

    private static async Task<ValidationProblemDetails> ReadValidationProblemAsync(
        HttpResponseMessage response)
    {
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);

        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        return Assert.IsType<ValidationProblemDetails>(problem);
    }

    private static async Task<ProblemDetails> ReadProblemAsync(
        HttpResponseMessage response,
        HttpStatusCode expectedStatus)
    {
        Assert.Equal(expectedStatus, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);

        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        return Assert.IsType<ProblemDetails>(problem);
    }
}
