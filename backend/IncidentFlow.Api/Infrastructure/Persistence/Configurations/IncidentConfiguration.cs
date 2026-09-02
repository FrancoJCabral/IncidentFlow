using IncidentFlow.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace IncidentFlow.Api.Infrastructure.Persistence.Configurations;

public class IncidentConfiguration : IEntityTypeConfiguration<Incident>
{
    public void Configure(EntityTypeBuilder<Incident> builder)
    {
        builder.ToTable("Incidents");

        builder.HasKey(incident => incident.Id);

        builder.Property(incident => incident.Id)
            .ValueGeneratedNever()
            .IsRequired();

        builder.Property(incident => incident.Title)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(incident => incident.Description)
            .HasMaxLength(4000)
            .IsRequired();

        builder.Property(incident => incident.Priority)
            .HasConversion<string>()
            .HasMaxLength(8)
            .IsRequired();

        builder.Property(incident => incident.Status)
            .HasConversion<string>()
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(incident => incident.Category)
            .HasConversion<string>()
            .HasMaxLength(8)
            .IsRequired();

        builder.Property(incident => incident.CreatedAt)
            .IsRequired();

        builder.Property(incident => incident.UpdatedAt)
            .IsRequired(false);

        builder.Property(incident => incident.ResolvedAt)
            .IsRequired(false);

        builder.HasIndex(incident => incident.Status);
        builder.HasIndex(incident => incident.Priority);
        builder.HasIndex(incident => incident.Category);
        builder.HasIndex(incident => incident.CreatedAt);
    }
}
