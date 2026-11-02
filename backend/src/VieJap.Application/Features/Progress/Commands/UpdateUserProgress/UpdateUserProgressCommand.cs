using MediatR;
using Microsoft.EntityFrameworkCore;
using VieJap.Application.Common.Interfaces;
using VieJap.Application.Features.Progress.DTOs;
using VieJap.Domain.Entities;

namespace VieJap.Application.Features.Progress.Commands.UpdateUserProgress;

public record UpdateUserProgressCommand(
    List<int>? LearnedItemIds,
    List<int>? ForgottenItemIds
) : IRequest<UserProgressDto>;

public class UpdateUserProgressCommandHandler : IRequestHandler<UpdateUserProgressCommand, UserProgressDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateUserProgressCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<UserProgressDto> Handle(UpdateUserProgressCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId
            ?? throw new UnauthorizedAccessException("Người dùng chưa được xác thực.");

        var progress = await _context.UserProgresses
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);

        if (progress == null)
        {
            progress = new UserProgress
            {
                UserId = userId,
                LearnedItemIds = request.LearnedItemIds?.Distinct().ToList() ?? new List<int>(),
                ForgottenItemIds = request.ForgottenItemIds?.Distinct().ToList() ?? new List<int>(),
                UpdatedAt = DateTime.UtcNow
            };

            await _context.UserProgresses.AddAsync(progress, cancellationToken);
        }
        else
        {
            if (request.LearnedItemIds != null)
            {
                progress.LearnedItemIds = request.LearnedItemIds.Distinct().ToList();
            }

            if (request.ForgottenItemIds != null)
            {
                progress.ForgottenItemIds = request.ForgottenItemIds.Distinct().ToList();
            }

            progress.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new UserProgressDto(
            UserId: progress.UserId,
            LearnedItemIds: progress.LearnedItemIds,
            ForgottenItemIds: progress.ForgottenItemIds,
            UpdatedAt: progress.UpdatedAt
        );
    }
}
