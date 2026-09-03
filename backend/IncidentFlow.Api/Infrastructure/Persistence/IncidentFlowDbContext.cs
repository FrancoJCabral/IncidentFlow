using IncidentFlow.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace IncidentFlow.Api.Infrastructure.Persistence;

public class IncidentFlowDbContext(DbContextOptions<IncidentFlowDbContext> options)
    : DbContext(options)
{
    public DbSet<Incident> Incidents => Set<Incident>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(IncidentFlowDbContext).Assembly);
    }
}
