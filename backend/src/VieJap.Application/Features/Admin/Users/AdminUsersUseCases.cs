using MediatR;
using Microsoft.EntityFrameworkCore;
using VieJap.Application.Common.Interfaces;
using VieJap.Application.Common.Models;

namespace VieJap.Application.Features.Admin.Users;

// 1. Query: Lấy danh sách toàn bộ người dùng
public record GetUsersAdminQuery : IRequest<List<UserProfileDto>>;

public class GetUsersAdminQueryHandler : IRequestHandler<GetUsersAdminQuery, List<UserProfileDto>>
{
    private readonly IApplicationDbContext _context;

    public GetUsersAdminQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserProfileDto>> Handle(GetUsersAdminQuery request, CancellationToken cancellationToken)
    {
        var users = await _context.Users
            .Include(u => u.Progress)
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync(cancellationToken);

        return users.Select(u => new UserProfileDto(
            UserId: u.Id,
            Username: u.Username,
            Email: u.Email,
            FullName: u.FullName,
            Role: u.Role,
            AvatarUrl: u.AvatarUrl,
            IsActive: u.IsActive,
            CreatedAt: u.CreatedAt,
            LastLoginAt: u.LastLoginAt,
            LearnedCount: u.Progress?.LearnedItemIds?.Count ?? 0,
            ForgottenCount: u.Progress?.ForgottenItemIds?.Count ?? 0
        )).ToList();
    }
}

// 2. Command: Bật / Khóa tài khoản người dùng
public record ToggleUserStatusAdminCommand(Guid UserId) : IRequest<bool>;

public class ToggleUserStatusAdminCommandHandler : IRequestHandler<ToggleUserStatusAdminCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public ToggleUserStatusAdminCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(ToggleUserStatusAdminCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FindAsync(new object[] { request.UserId }, cancellationToken);
        if (user == null)
        {
            throw new KeyNotFoundException("Không tìm thấy người dùng.");
        }

        user.IsActive = !user.IsActive;
        await _context.SaveChangesAsync(cancellationToken);
        return user.IsActive;
    }
}

// 3. Command: Đặt lại mật khẩu người dùng
public record ResetUserPasswordAdminCommand(Guid UserId, string NewPassword) : IRequest<bool>;

public class ResetUserPasswordAdminCommandHandler : IRequestHandler<ResetUserPasswordAdminCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public ResetUserPasswordAdminCommandHandler(IApplicationDbContext context, IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<bool> Handle(ResetUserPasswordAdminCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FindAsync(new object[] { request.UserId }, cancellationToken);
        if (user == null)
        {
            throw new KeyNotFoundException("Không tìm thấy người dùng.");
        }

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
        {
            throw new ArgumentException("Mật khẩu mới phải có ít nhất 6 ký tự.");
        }

        user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

// 4. Command: Xóa người dùng
public record DeleteUserAdminCommand(Guid UserId) : IRequest<bool>;

public class DeleteUserAdminCommandHandler : IRequestHandler<DeleteUserAdminCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteUserAdminCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteUserAdminCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FindAsync(new object[] { request.UserId }, cancellationToken);
        if (user == null)
        {
            throw new KeyNotFoundException("Không tìm thấy người dùng.");
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
