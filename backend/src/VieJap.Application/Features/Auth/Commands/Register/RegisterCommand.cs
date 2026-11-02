using MediatR;
using Microsoft.EntityFrameworkCore;
using VieJap.Application.Common.Interfaces;
using VieJap.Application.Common.Models;
using VieJap.Domain.Entities;

namespace VieJap.Application.Features.Auth.Commands.Register;

public record RegisterCommand(
    string Username,
    string Email,
    string FullName,
    string Password,
    string RegistrationCode
) : IRequest<AuthResponse>;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;

    public RegisterCommandHandler(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<AuthResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var username = request.Username.Trim();
        var email = request.Email.Trim().ToLowerInvariant();
        var codeStr = request.RegistrationCode.Trim().ToUpperInvariant();

        if (string.IsNullOrWhiteSpace(username) || username.Length < 3)
        {
            throw new ArgumentException("Tên đăng nhập phải có ít nhất 3 ký tự.");
        }

        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
        {
            throw new ArgumentException("Email không hợp lệ.");
        }

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
        {
            throw new ArgumentException("Mật khẩu phải có ít nhất 6 ký tự.");
        }

        if (string.IsNullOrWhiteSpace(codeStr))
        {
            throw new ArgumentException("Vui lòng nhập Mã code đăng ký.");
        }

        // 1. Kiểm tra mã code đăng ký
        var regCode = await _context.RegistrationCodes
            .FirstOrDefaultAsync(c => c.Code.ToUpper() == codeStr, cancellationToken);

        if (regCode == null || !regCode.IsValid())
        {
            throw new ArgumentException("Mã code đăng ký không hợp lệ, đã bị vô hiệu hóa hoặc đã hết lượt sử dụng.");
        }

        // 2. Kiểm tra tài khoản / email đã tồn tại chưa
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower() || u.Email.ToLower() == email, cancellationToken);

        if (existingUser != null)
        {
            if (existingUser.Username.Equals(username, StringComparison.OrdinalIgnoreCase))
            {
                throw new ArgumentException("Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác.");
            }
            throw new ArgumentException("Email này đã được đăng ký tài khoản. Vui lòng đăng nhập.");
        }

        // 3. Tăng lượt sử dụng của mã code
        regCode.UsedCount += 1;

        // 4. Tạo User mới
        var user = new User
        {
            Username = username,
            Email = email,
            FullName = string.IsNullOrWhiteSpace(request.FullName) ? username : request.FullName.Trim(),
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            Role = "User",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow
        };

        // 5. Khởi tạo UserProgress rỗng
        var progress = new UserProgress
        {
            UserId = user.Id,
            User = user,
            LearnedItemIds = new List<int>(),
            ForgottenItemIds = new List<int>(),
            UpdatedAt = DateTime.UtcNow
        };

        user.Progress = progress;

        await _context.Users.AddAsync(user, cancellationToken);
        await _context.UserProgresses.AddAsync(progress, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        // 6. Cấp JWT Token
        var token = _jwtTokenService.GenerateToken(user);

        return new AuthResponse(
            Token: token,
            UserId: user.Id,
            Username: user.Username,
            Email: user.Email,
            FullName: user.FullName,
            Role: user.Role,
            AvatarUrl: user.AvatarUrl
        );
    }
}
