using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using IncidentFlow.Api.Domain.Enums;
using Xunit;

namespace IncidentFlow.Api.Tests;

public class IncidentArchivingApiTests : IClassFixture<CustomWebApplicationFactory>, IAsyncLifetime
{
    private readonly CustomWebApplicationFactory factory;
    private readonly HttpClient client;

    public IncidentArchivingApiTests(CustomWebApplicationFactory factory)
    {
        this.factory = factory;
        client = factory.CreateClient();
    }

    public async Task InitializeAsync() => await AuthenticateAsync(client);
    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task Delete_WithoutToken_ReturnsUnauthorized()
    {
        using var anonymous = factory.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.DeleteAsync($"/api/incidents/{Guid.NewGuid()}")).StatusCode);
    }

    [Fact]
    public async Task Delete_UnknownId_ReturnsNotFound() =>
        Assert.Equal(HttpStatusCode.NotFound, (await client.DeleteAsync($"/api/incidents/{Guid.NewGuid()}")).StatusCode);

    [Fact]
    public async Task Delete_OpenIncident_ReturnsBadRequest()
    {
        var id = await CreateIncidentAsync();
        Assert.Equal(HttpStatusCode.BadRequest, (await client.DeleteAsync($"/api/incidents/{id}")).StatusCode);
    }

    [Fact]
    public async Task Delete_InProgressIncident_ReturnsBadRequest()
    {
        var id = await CreateIncidentAsync();
        await ChangeStatusAsync(id, "InProgress");
        Assert.Equal(HttpStatusCode.BadRequest, (await client.DeleteAsync($"/api/incidents/{id}")).StatusCode);
    }

    [Fact]
    public async Task Delete_ResolvedIncident_ReturnsBadRequest()
    {
        var id = await CreateResolvedIncidentAsync();
        Assert.Equal(HttpStatusCode.BadRequest, (await client.DeleteAsync($"/api/incidents/{id}")).StatusCode);
    }

    [Fact]
    public async Task Delete_ClosedIncident_ReturnsNoContent()
    {
        var id = await CreateClosedIncidentAsync();
        Assert.Equal(HttpStatusCode.NoContent, (await client.DeleteAsync($"/api/incidents/{id}")).StatusCode);
    }

    [Fact]
    public async Task GetAll_AfterArchive_ExcludesIncident()
    {
        var id = await ArchiveClosedIncidentAsync();
        var incidents = await client.GetFromJsonAsync<JsonElement[]>("/api/incidents");
        Assert.DoesNotContain(incidents!, item => item.GetProperty("id").GetGuid() == id);
    }

    [Fact]
    public async Task GetById_AfterArchive_ReturnsNotFound()
    {
        var id = await ArchiveClosedIncidentAsync();
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/api/incidents/{id}")).StatusCode);
    }

    [Fact]
    public async Task Archive_PreservesStoredRecordAndSetsArchiveFields()
    {
        var id = await ArchiveClosedIncidentAsync();
        var stored = await factory.GetIncidentIgnoringFiltersAsync(id);
        Assert.NotNull(stored);
        Assert.True(stored.IsArchived);
        Assert.NotNull(stored.ArchivedAt);
        Assert.Equal(stored.ArchivedAt, stored.UpdatedAt);
    }

    [Fact]
    public async Task Delete_AlreadyArchivedIncident_ReturnsNotFound()
    {
        var id = await ArchiveClosedIncidentAsync();
        Assert.Equal(HttpStatusCode.NotFound, (await client.DeleteAsync($"/api/incidents/{id}")).StatusCode);
    }

    private async Task<Guid> ArchiveClosedIncidentAsync()
    {
        var id = await CreateClosedIncidentAsync();
        (await client.DeleteAsync($"/api/incidents/{id}")).EnsureSuccessStatusCode();
        return id;
    }

    private async Task<Guid> CreateClosedIncidentAsync()
    {
        var id = await CreateResolvedIncidentAsync();
        await ChangeStatusAsync(id, "Closed");
        return id;
    }

    private async Task<Guid> CreateResolvedIncidentAsync()
    {
        var id = await CreateIncidentAsync();
        await ChangeStatusAsync(id, "InProgress");
        await ChangeStatusAsync(id, "Resolved");
        return id;
    }

    private async Task<Guid> CreateIncidentAsync()
    {
        var response = await client.PostAsJsonAsync("/api/incidents", new
        {
            title = $"Archive test {Guid.NewGuid():N}", description = "Archive integration test", priority = "Medium", category = "Other"
        });
        response.EnsureSuccessStatusCode();
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return document.RootElement.GetProperty("id").GetGuid();
    }

    private async Task ChangeStatusAsync(Guid id, string status) =>
        (await client.PatchAsJsonAsync($"/api/incidents/{id}/status", new { status })).EnsureSuccessStatusCode();

    private static async Task AuthenticateAsync(HttpClient httpClient)
    {
        var response = await httpClient.PostAsJsonAsync("/api/auth/register", new
        {
            email = $"archive-tests-{Guid.NewGuid():N}@example.com", password = "TestPassword123!"
        });
        response.EnsureSuccessStatusCode();
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer", document.RootElement.GetProperty("accessToken").GetString());
    }
}
