using Microsoft.EntityFrameworkCore;
using VieJap.Domain.Entities;

namespace VieJap.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<UserProgress> UserProgresses { get; }
    DbSet<RegistrationCode> RegistrationCodes { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
