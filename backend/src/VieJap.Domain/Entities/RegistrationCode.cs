using VieJap.Domain.Common;

namespace VieJap.Domain.Entities;

public class RegistrationCode : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    /// <summary>
    /// Số lượt sử dụng tối đa (0 = không giới hạn lượt dùng)
    /// </summary>
    public int MaxUses { get; set; } = 1;

    /// <summary>
    /// Số lượt đã được kích hoạt sử dụng
    /// </summary>
    public int UsedCount { get; set; } = 0;

    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Thời hạn sử dụng (null = vĩnh viễn)
    /// </summary>
    public DateTime? ExpiresAt { get; set; }

    public string? CreatedBy { get; set; }

    public bool IsValid()
    {
        if (!IsActive) return false;
        if (ExpiresAt.HasValue && ExpiresAt.Value < DateTime.UtcNow) return false;
        if (MaxUses > 0 && UsedCount >= MaxUses) return false;
        return true;
    }
}
