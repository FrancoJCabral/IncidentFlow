using System.Data.Common;
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
            throw new ApplicationException("Sensitive database failure details.");
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
