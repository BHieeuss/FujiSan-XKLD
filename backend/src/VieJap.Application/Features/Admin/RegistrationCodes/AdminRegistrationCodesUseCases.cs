using MediatR;
using Microsoft.EntityFrameworkCore;
using VieJap.Application.Common.Interfaces;
using VieJap.Application.Common.Models;
using VieJap.Domain.Entities;

namespace VieJap.Application.Features.Admin.RegistrationCodes;

// 1. Query: Lấy danh sách tất cả mã code đăng ký
public record GetRegistrationCodesAdminQuery : IRequest<List<RegistrationCodeDto>>;

public class GetRegistrationCodesAdminQueryHandler : IRequestHandler<GetRegistrationCodesAdminQuery, List<RegistrationCodeDto>>
{
    private readonly IApplicationDbContext _context;

    public GetRegistrationCodesAdminQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<RegistrationCodeDto>> Handle(GetRegistrationCodesAdminQuery request, CancellationToken cancellationToken)
    {
        var codes = await _context.RegistrationCodes
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(cancellationToken);

        return codes.Select(c => new RegistrationCodeDto(
            Id: c.Id,
            Code: c.Code,
            Description: c.Description,
            MaxUses: c.MaxUses,
            UsedCount: c.UsedCount,
            IsActive: c.IsActive,
            ExpiresAt: c.ExpiresAt,
            CreatedBy: c.CreatedBy,
            CreatedAt: c.CreatedAt,
            IsValid: c.IsValid()
        )).ToList();
    }
}

// 2. Command: Tạo mã code đăng ký mới
public record CreateRegistrationCodeAdminCommand(
    string? Code,
    string? Description,
    int MaxUses = 1,
    DateTime? ExpiresAt = null,
    string? CreatedBy = null
) : IRequest<RegistrationCodeDto>;

public class CreateRegistrationCodeAdminCommandHandler : IRequestHandler<CreateRegistrationCodeAdminCommand, RegistrationCodeDto>
{
    private readonly IApplicationDbContext _context;

    public CreateRegistrationCodeAdminCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<RegistrationCodeDto> Handle(CreateRegistrationCodeAdminCommand request, CancellationToken cancellationToken)
    {
        // Tự sinh mã ngẫu nhiên 8 ký tự nếu người dùng không nhập mã tùy biến
        var codeStr = !string.IsNullOrWhiteSpace(request.Code)
            ? request.Code.Trim().ToUpperInvariant()
            : GenerateRandomCode();

        var existing = await _context.RegistrationCodes
            .FirstOrDefaultAsync(c => c.Code.ToUpper() == codeStr, cancellationToken);

        if (existing != null)
        {
            throw new ArgumentException($"Mã code '{codeStr}' đã tồn tại trong hệ thống. Vui lòng chọn mã khác.");
        }

        var regCode = new RegistrationCode
        {
            Code = codeStr,
            Description = request.Description?.Trim(),
            MaxUses = request.MaxUses < 0 ? 0 : request.MaxUses,
            UsedCount = 0,
            IsActive = true,
            ExpiresAt = request.ExpiresAt,
            CreatedBy = request.CreatedBy ?? "Admin",
            CreatedAt = DateTime.UtcNow
        };

        await _context.RegistrationCodes.AddAsync(regCode, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return new RegistrationCodeDto(
            Id: regCode.Id,
            Code: regCode.Code,
            Description: regCode.Description,
            MaxUses: regCode.MaxUses,
            UsedCount: regCode.UsedCount,
            IsActive: regCode.IsActive,
            ExpiresAt: regCode.ExpiresAt,
            CreatedBy: regCode.CreatedBy,
            CreatedAt: regCode.CreatedAt,
            IsValid: regCode.IsValid()
        );
    }

    private static string GenerateRandomCode()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var random = new Random();
        var codeChars = new char[8];
        for (int i = 0; i < 8; i++)
        {
            codeChars[i] = chars[random.Next(chars.Length)];
        }
        return new string(codeChars);
    }
}

// 3. Command: Bật / Tắt trạng thái mã code
public record ToggleRegistrationCodeStatusAdminCommand(Guid Id) : IRequest<bool>;

public class ToggleRegistrationCodeStatusAdminCommandHandler : IRequestHandler<ToggleRegistrationCodeStatusAdminCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public ToggleRegistrationCodeStatusAdminCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(ToggleRegistrationCodeStatusAdminCommand request, CancellationToken cancellationToken)
    {
        var code = await _context.RegistrationCodes.FindAsync(new object[] { request.Id }, cancellationToken);
        if (code == null)
        {
            throw new KeyNotFoundException("Không tìm thấy mã code.");
        }

        code.IsActive = !code.IsActive;
        await _context.SaveChangesAsync(cancellationToken);
        return code.IsActive;
    }
}

// 4. Command: Xóa mã code
public record DeleteRegistrationCodeAdminCommand(Guid Id) : IRequest<bool>;

public class DeleteRegistrationCodeAdminCommandHandler : IRequestHandler<DeleteRegistrationCodeAdminCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteRegistrationCodeAdminCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteRegistrationCodeAdminCommand request, CancellationToken cancellationToken)
    {
        var code = await _context.RegistrationCodes.FindAsync(new object[] { request.Id }, cancellationToken);
        if (code == null)
        {
            throw new KeyNotFoundException("Không tìm thấy mã code.");
        }

        _context.RegistrationCodes.Remove(code);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
