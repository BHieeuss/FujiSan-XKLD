using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VieJap.Domain.Entities;

namespace VieJap.Infrastructure.Persistence.Configurations;

public class UserProgressConfiguration : IEntityTypeConfiguration<UserProgress>
{
    public void Configure(EntityTypeBuilder<UserProgress> builder)
    {
        builder.ToTable("user_progresses");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.UserId)
            .IsRequired();

        builder.HasIndex(p => p.UserId)
            .IsUnique();

        // Cấu hình mảng int[] native trong PostgreSQL
        builder.Property(p => p.LearnedItemIds)
            .HasColumnType("integer[]")
            .IsRequired();

        builder.Property(p => p.ForgottenItemIds)
            .HasColumnType("integer[]")
            .IsRequired();

        builder.Property(p => p.UpdatedAt)
            .IsRequired();
    }
}
