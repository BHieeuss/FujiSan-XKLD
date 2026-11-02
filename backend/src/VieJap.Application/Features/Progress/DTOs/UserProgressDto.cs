namespace VieJap.Application.Features.Progress.DTOs;

public record UserProgressDto(
    Guid UserId,
    List<int> LearnedItemIds,
    List<int> ForgottenItemIds,
    DateTime UpdatedAt
);
