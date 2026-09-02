using IncidentFlow.Api.Domain.Enums;

namespace IncidentFlow.Api.Domain.Entities;

public class Incident
{
    public Guid Id { get; }
    public string Title { get; private set; }
    public string Description { get; private set; }
    public IncidentPriority Priority { get; private set; }
    public IncidentStatus Status { get; private set; }
    public IncidentCategory Category { get; private set; }
    public DateTimeOffset CreatedAt { get; }
    public DateTimeOffset? UpdatedAt { get; private set; }
    public DateTimeOffset? ResolvedAt { get; private set; }

    public Incident(
        string title,
        string description,
        IncidentPriority priority,
        IncidentCategory category)
    {
        Title = ValidateTitle(title);
        Description = ValidateDescription(description);
        Priority = ValidatePriority(priority);
        Category = ValidateCategory(category);

        Id = Guid.NewGuid();
        Status = IncidentStatus.Open;
        CreatedAt = DateTimeOffset.UtcNow;
        UpdatedAt = null;
        ResolvedAt = null;
    }

    public void Update(
        string title,
        string description,
        IncidentPriority priority,
        IncidentCategory category)
    {
        var validatedTitle = ValidateTitle(title);
        var validatedDescription = ValidateDescription(description);
        var validatedPriority = ValidatePriority(priority);
        var validatedCategory = ValidateCategory(category);

        Title = validatedTitle;
        Description = validatedDescription;
        Priority = validatedPriority;
        Category = validatedCategory;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void ChangeStatus(IncidentStatus newStatus)
    {
        var isAllowed = (Status, newStatus) switch
        {
            (IncidentStatus.Open, IncidentStatus.InProgress) => true,
            (IncidentStatus.InProgress, IncidentStatus.Resolved) => true,
            (IncidentStatus.Resolved, IncidentStatus.Closed) => true,
            (IncidentStatus.Resolved, IncidentStatus.InProgress) => true,
            _ => false
        };

        if (!isAllowed)
        {
            throw new InvalidOperationException(
                $"The transition from '{Status}' to '{newStatus}' is not allowed.");
        }

        var changedAt = DateTimeOffset.UtcNow;

        if (newStatus == IncidentStatus.Resolved)
        {
            ResolvedAt = changedAt;
        }
        else if (Status == IncidentStatus.Resolved && newStatus == IncidentStatus.InProgress)
        {
            ResolvedAt = null;
        }

        Status = newStatus;
        UpdatedAt = changedAt;
    }

    private static string ValidateTitle(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            throw new ArgumentException(
                "The incident title cannot be null, empty, or contain only whitespace.",
                nameof(title));
        }

        return title.Trim();
    }

    private static string ValidateDescription(string description)
    {
        if (string.IsNullOrWhiteSpace(description))
        {
            throw new ArgumentException(
                "The incident description cannot be null, empty, or contain only whitespace.",
                nameof(description));
        }

        return description.Trim();
    }

    private static IncidentPriority ValidatePriority(IncidentPriority priority)
    {
        if (!Enum.IsDefined(priority))
        {
            throw new ArgumentException(
                "The incident priority must be a defined value.",
                nameof(priority));
        }

        return priority;
    }

    private static IncidentCategory ValidateCategory(IncidentCategory category)
    {
        if (!Enum.IsDefined(category))
        {
            throw new ArgumentException(
                "The incident category must be a defined value.",
                nameof(category));
        }

        return category;
    }
}
