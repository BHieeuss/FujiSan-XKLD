namespace VieJap.Application.Common.Models;

public record AuthResponse(
    string Token,
    Guid UserId,
    string Username,
    string Email,
    string FullName,
    string Role,
    string? AvatarUrl
);

public record UserProfileDto(
    Guid UserId,
    string Username,
    string Email,
    string FullName,
    string Role,
    string? AvatarUrl,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? LastLoginAt,
    int LearnedCount,
    int ForgottenCount
);

public record RegistrationCodeDto(
    Guid Id,
    string Code,
    string? Description,
    int MaxUses,
    int UsedCount,
    bool IsActive,
    DateTime? ExpiresAt,
    string? CreatedBy,
    DateTime CreatedAt,
    bool IsValid
);
