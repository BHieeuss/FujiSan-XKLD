using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VieJap.Domain.Entities;

namespace VieJap.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Username)
            .IsRequired()
            .HasMaxLength(64);

        builder.HasIndex(u => u.Username)
            .IsUnique();

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(256);

        builder.HasIndex(u => u.Email)
            .IsUnique();

        builder.Property(u => u.FullName)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(u => u.PasswordHash)
            .IsRequired();

        builder.Property(u => u.Role)
            .IsRequired()
            .HasMaxLength(32);

        builder.Property(u => u.AvatarUrl)
            .HasMaxLength(1024);

        builder.Property(u => u.IsActive)
            .IsRequired();

        // 1-1 relationship with UserProgress
        builder.HasOne(u => u.Progress)
            .WithOne(p => p.User)
            .HasForeignKey<UserProgress>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
