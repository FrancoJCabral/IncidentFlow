using IncidentFlow.Api.Domain.Enums;

namespace IncidentFlow.Api.Domain.Entities;

public class User
{
    public Guid Id { get; }
    public string Email { get; private set; }
    internal string PasswordHash { get; private set; }
    public UserRole Role { get; private set; }
    public DateTimeOffset CreatedAt { get; }

    private User()
    {
        Email = null!;
        PasswordHash = null!;
    }

    public User(string email, string passwordHash, UserRole role)
    {
        Email = NormalizeEmail(email);
        PasswordHash = ValidatePasswordHash(passwordHash);
        Role = ValidateRole(role);
        Id = Guid.NewGuid();
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public static string NormalizeEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ArgumentException("Email is required.", nameof(email));
        }

        return email.Trim().ToLowerInvariant();
    }

    private static string ValidatePasswordHash(string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(passwordHash))
        {
            throw new ArgumentException("Password hash is required.", nameof(passwordHash));
        }

        return passwordHash;
    }

    private static UserRole ValidateRole(UserRole role)
    {
        if (!Enum.IsDefined(role))
        {
            throw new ArgumentException("User role must be a defined value.", nameof(role));
        }

        return role;
    }
}
