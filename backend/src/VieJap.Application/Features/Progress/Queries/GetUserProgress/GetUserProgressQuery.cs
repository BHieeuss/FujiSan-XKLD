using MediatR;
using Microsoft.EntityFrameworkCore;
using VieJap.Application.Common.Interfaces;
using VieJap.Application.Features.Progress.DTOs;
using VieJap.Domain.Entities;

namespace VieJap.Application.Features.Progress.Queries.GetUserProgress;

public record GetUserProgressQuery : IRequest<UserProgressDto>;

public class GetUserProgressQueryHandler : IRequestHandler<GetUserProgressQuery, UserProgressDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetUserProgressQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<UserProgressDto> Handle(GetUserProgressQuery request, CancellationToken cancellationToken)
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
                LearnedItemIds = new List<int>(),
                ForgottenItemIds = new List<int>(),
                UpdatedAt = DateTime.UtcNow
            };

            await _context.UserProgresses.AddAsync(progress, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return new UserProgressDto(
            UserId: progress.UserId,
            LearnedItemIds: progress.LearnedItemIds,
            ForgottenItemIds: progress.ForgottenItemIds,
            UpdatedAt: progress.UpdatedAt
        );
    }
}
