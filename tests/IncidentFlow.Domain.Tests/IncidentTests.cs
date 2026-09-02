using IncidentFlow.Api.Domain.Entities;
using IncidentFlow.Api.Domain.Enums;
using Xunit;

namespace IncidentFlow.Domain.Tests;

public class IncidentTests
{
    [Fact]
    public void Constructor_WithValidData_CreatesOpenIncident()
    {
        var beforeCreation = DateTimeOffset.UtcNow;

        var incident = CreateIncident();

        var afterCreation = DateTimeOffset.UtcNow;

        Assert.NotEqual(Guid.Empty, incident.Id);
        Assert.Equal("Application unavailable", incident.Title);
        Assert.Equal("The application cannot be opened.", incident.Description);
        Assert.Equal(IncidentPriority.High, incident.Priority);
        Assert.Equal(IncidentCategory.Software, incident.Category);
        Assert.Equal(IncidentStatus.Open, incident.Status);
        Assert.Equal(TimeSpan.Zero, incident.CreatedAt.Offset);
        Assert.InRange(incident.CreatedAt, beforeCreation, afterCreation);
        Assert.Null(incident.UpdatedAt);
        Assert.Null(incident.ResolvedAt);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Constructor_WithInvalidTitle_ThrowsArgumentException(string? title)
    {
        Assert.Throws<ArgumentException>(() => new Incident(
            title!,
            "Valid description",
            IncidentPriority.Medium,
            IncidentCategory.Hardware));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Constructor_WithInvalidDescription_ThrowsArgumentException(string? description)
    {
        Assert.Throws<ArgumentException>(() => new Incident(
            "Valid title",
            description!,
            IncidentPriority.Medium,
            IncidentCategory.Hardware));
    }

    [Fact]
    public void Constructor_WithUndefinedPriority_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() => new Incident(
            "Valid title",
            "Valid description",
            (IncidentPriority)int.MaxValue,
            IncidentCategory.Hardware));
    }

    [Fact]
    public void Constructor_WithUndefinedCategory_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() => new Incident(
            "Valid title",
            "Valid description",
            IncidentPriority.Medium,
            (IncidentCategory)int.MaxValue));
    }

    [Fact]
    public void Update_WithValidData_UpdatesEditableInformationOnly()
    {
        var incident = CreateIncident();
        var originalCreatedAt = incident.CreatedAt;
        var originalStatus = incident.Status;
        var originalResolvedAt = incident.ResolvedAt;
        var beforeUpdate = DateTimeOffset.UtcNow;

        incident.Update(
            "Network unavailable",
            "The office network is unavailable.",
            IncidentPriority.Critical,
            IncidentCategory.Network);

        var afterUpdate = DateTimeOffset.UtcNow;

        Assert.Equal("Network unavailable", incident.Title);
        Assert.Equal("The office network is unavailable.", incident.Description);
        Assert.Equal(IncidentPriority.Critical, incident.Priority);
        Assert.Equal(IncidentCategory.Network, incident.Category);
        Assert.NotNull(incident.UpdatedAt);
        Assert.InRange(incident.UpdatedAt.Value, beforeUpdate, afterUpdate);
        Assert.Equal(originalStatus, incident.Status);
        Assert.Equal(originalCreatedAt, incident.CreatedAt);
        Assert.Equal(originalResolvedAt, incident.ResolvedAt);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void Update_WithUndefinedEnum_DoesNotPartiallyModifyIncident(bool invalidPriority)
    {
        var incident = CreateIncident();
        var originalTitle = incident.Title;
        var originalDescription = incident.Description;
        var originalPriority = incident.Priority;
        var originalCategory = incident.Category;

        Assert.Throws<ArgumentException>(() => incident.Update(
            "Changed title",
            "Changed description",
            invalidPriority ? (IncidentPriority)int.MaxValue : IncidentPriority.Low,
            invalidPriority ? IncidentCategory.Access : (IncidentCategory)int.MaxValue));

        Assert.Equal(originalTitle, incident.Title);
        Assert.Equal(originalDescription, incident.Description);
        Assert.Equal(originalPriority, incident.Priority);
        Assert.Equal(originalCategory, incident.Category);
        Assert.Null(incident.UpdatedAt);
    }

    [Fact]
    public void ChangeStatus_FromOpenToInProgress_UpdatesStatusAndTimestamp()
    {
        var incident = CreateIncident();

        incident.ChangeStatus(IncidentStatus.InProgress);

        Assert.Equal(IncidentStatus.InProgress, incident.Status);
        Assert.NotNull(incident.UpdatedAt);
        Assert.Null(incident.ResolvedAt);
    }

    [Fact]
    public void ChangeStatus_FromInProgressToResolved_SetsResolutionTimestamp()
    {
        var incident = CreateInProgressIncident();

        incident.ChangeStatus(IncidentStatus.Resolved);

        Assert.Equal(IncidentStatus.Resolved, incident.Status);
        Assert.NotNull(incident.UpdatedAt);
        Assert.NotNull(incident.ResolvedAt);
        Assert.Equal(incident.UpdatedAt, incident.ResolvedAt);
    }

    [Fact]
    public void ChangeStatus_FromResolvedToClosed_PreservesResolutionTimestamp()
    {
        var incident = CreateResolvedIncident();
        var resolvedAt = incident.ResolvedAt;

        incident.ChangeStatus(IncidentStatus.Closed);

        Assert.Equal(IncidentStatus.Closed, incident.Status);
        Assert.NotNull(incident.UpdatedAt);
        Assert.Equal(resolvedAt, incident.ResolvedAt);
    }

    [Fact]
    public void ChangeStatus_FromResolvedToInProgress_ClearsResolutionTimestamp()
    {
        var incident = CreateResolvedIncident();

        incident.ChangeStatus(IncidentStatus.InProgress);

        Assert.Equal(IncidentStatus.InProgress, incident.Status);
        Assert.NotNull(incident.UpdatedAt);
        Assert.Null(incident.ResolvedAt);
    }

    [Theory]
    [InlineData(IncidentStatus.Open, IncidentStatus.Resolved)]
    [InlineData(IncidentStatus.Open, IncidentStatus.Closed)]
    [InlineData(IncidentStatus.Open, IncidentStatus.Open)]
    [InlineData(IncidentStatus.InProgress, IncidentStatus.Open)]
    [InlineData(IncidentStatus.InProgress, IncidentStatus.Closed)]
    [InlineData(IncidentStatus.Resolved, IncidentStatus.Open)]
    [InlineData(IncidentStatus.Resolved, IncidentStatus.Resolved)]
    [InlineData(IncidentStatus.Closed, IncidentStatus.Open)]
    [InlineData(IncidentStatus.Closed, IncidentStatus.InProgress)]
    [InlineData(IncidentStatus.Closed, IncidentStatus.Resolved)]
    [InlineData(IncidentStatus.Closed, IncidentStatus.Closed)]
    public void ChangeStatus_WithInvalidTransition_ThrowsInvalidOperationException(
        IncidentStatus currentStatus,
        IncidentStatus newStatus)
    {
        var incident = CreateIncidentInStatus(currentStatus);

        Assert.Throws<InvalidOperationException>(() => incident.ChangeStatus(newStatus));
    }

    [Theory]
    [InlineData(IncidentStatus.Open)]
    [InlineData(IncidentStatus.InProgress)]
    [InlineData(IncidentStatus.Resolved)]
    [InlineData(IncidentStatus.Closed)]
    public void ChangeStatus_WhenClosed_CannotTransitionToAnyStatus(IncidentStatus newStatus)
    {
        var incident = CreateIncidentInStatus(IncidentStatus.Closed);

        Assert.Throws<InvalidOperationException>(() => incident.ChangeStatus(newStatus));
        Assert.Equal(IncidentStatus.Closed, incident.Status);
    }

    private static Incident CreateIncident() => new(
        "Application unavailable",
        "The application cannot be opened.",
        IncidentPriority.High,
        IncidentCategory.Software);

    private static Incident CreateInProgressIncident()
    {
        var incident = CreateIncident();
        incident.ChangeStatus(IncidentStatus.InProgress);
        return incident;
    }

    private static Incident CreateResolvedIncident()
    {
        var incident = CreateInProgressIncident();
        incident.ChangeStatus(IncidentStatus.Resolved);
        return incident;
    }

    private static Incident CreateIncidentInStatus(IncidentStatus status)
    {
        var incident = CreateIncident();

        if (status >= IncidentStatus.InProgress)
        {
            incident.ChangeStatus(IncidentStatus.InProgress);
        }

        if (status >= IncidentStatus.Resolved)
        {
            incident.ChangeStatus(IncidentStatus.Resolved);
        }

        if (status >= IncidentStatus.Closed)
        {
            incident.ChangeStatus(IncidentStatus.Closed);
        }

        return incident;
    }
}
