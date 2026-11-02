using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VieJap.Domain.Entities;

namespace VieJap.Infrastructure.Persistence.Configurations;

public class RegistrationCodeConfiguration : IEntityTypeConfiguration<RegistrationCode>
{
    public void Configure(EntityTypeBuilder<RegistrationCode> builder)
    {
        builder.ToTable("registration_codes");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Code)
            .IsRequired()
            .HasMaxLength(32);

        builder.HasIndex(c => c.Code)
            .IsUnique();

        builder.Property(c => c.Description)
            .HasMaxLength(256);

        builder.Property(c => c.CreatedBy)
            .HasMaxLength(128);

        builder.Property(c => c.MaxUses)
            .IsRequired();

        builder.Property(c => c.UsedCount)
            .IsRequired();

        builder.Property(c => c.IsActive)
            .IsRequired();

        builder.Property(c => c.CreatedAt)
            .IsRequired();
    }
}
