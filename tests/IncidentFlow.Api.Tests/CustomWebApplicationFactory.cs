using System.Data.Common;
using IncidentFlow.Api.Domain.Entities;
using IncidentFlow.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;

namespace IncidentFlow.Api.Tests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly bool throwOnSave;
    private SqliteConnection? connection;

    public CustomWebApplicationFactory() : this(false)
    {
    }

    protected CustomWebApplicationFactory(bool throwOnSave)
    {
        this.throwOnSave = throwOnSave;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("Jwt:Issuer", "IncidentFlow.Tests");
        builder.UseSetting("Jwt:Audience", "IncidentFlow.Api.Tests");
        builder.UseSetting("Jwt:ExpirationMinutes", "15");
        builder.UseSetting(
            "Jwt:Key",
            "integration-tests-only-signing-key-at-least-32-bytes-long");

        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<IncidentFlowDbContext>();

            var dbContextRegistrations = services
                .Where(descriptor =>
                    descriptor.ServiceType.IsGenericType &&
                    descriptor.ServiceType.GenericTypeArguments.Contains(
                        typeof(IncidentFlowDbContext)))
                .ToList();

            foreach (var descriptor in dbContextRegistrations)
            {
                services.Remove(descriptor);
            }

            connection = new SqliteConnection("Data Source=:memory:");
            connection.Open();

            services.AddSingleton<DbConnection>(connection);
            services.AddDbContext<IncidentFlowDbContext>((serviceProvider, options) =>
            {
                options.UseSqlite(serviceProvider.GetRequiredService<DbConnection>());

                if (throwOnSave)
                {
                    options.AddInterceptors(new ThrowingSaveChangesInterceptor());
                }
            });
        });
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);

        using var scope = host.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<IncidentFlowDbContext>();
        dbContext.Database.EnsureCreated();

        return host;
    }

    public async Task<string?> GetStoredPasswordHashAsync(string email)
    {
        if (connection is null)
        {
            throw new InvalidOperationException("The test database is not initialized.");
        }

        await using var command = connection.CreateCommand();
        command.CommandText = "SELECT PasswordHash FROM Users WHERE Email = $email";
        var parameter = command.CreateParameter();
        parameter.ParameterName = "$email";
        parameter.Value = email;
        command.Parameters.Add(parameter);

        return await command.ExecuteScalarAsync() as string;
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);

        if (disposing)
        {
            connection?.Dispose();
        }
    }

    private sealed class ThrowingSaveChangesInterceptor : SaveChangesInterceptor
    {
        public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
            DbContextEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default)
        {
            var savesIncident = eventData.Context?.ChangeTracker
                .Entries<Incident>()
                .Any(entry => entry.State is EntityState.Added or EntityState.Modified) == true;

            return savesIncident
                ? throw new ApplicationException("Sensitive database failure details.")
                : ValueTask.FromResult(result);
        }
    }
}

public sealed class UnexpectedExceptionWebApplicationFactory
    : CustomWebApplicationFactory
{
    public UnexpectedExceptionWebApplicationFactory() : base(true)
    {
    }
}
