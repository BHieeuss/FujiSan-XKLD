using VieJap.Domain.Common;

namespace VieJap.Domain.Entities;

public class UserProgress : BaseEntity
{
    public Guid UserId { get; set; }
    public virtual User User { get; set; } = null!;

    /// <summary>
    /// Danh sách ID bài học / từ vựng đã ghi nhớ / hoàn thành.
    /// Lưu trữ trong PostgreSQL dưới dạng mảng int[] native.
    /// </summary>
    public List<int> LearnedItemIds { get; set; } = new();

    /// <summary>
    /// Danh sách ID các từ vựng / bài học đã quên, cần ôn tập lại.
    /// Lưu trữ trong PostgreSQL dưới dạng mảng int[] native.
    /// </summary>
    public List<int> ForgottenItemIds { get; set; } = new();

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
