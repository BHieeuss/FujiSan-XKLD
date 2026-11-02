using System.Reflection;
using Microsoft.EntityFrameworkCore;
using VieJap.Application.Common.Interfaces;
using VieJap.Domain.Entities;

namespace VieJap.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<UserProgress> UserProgresses => Set<UserProgress>();
    public DbSet<RegistrationCode> RegistrationCodes => Set<RegistrationCode>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return base.SaveChangesAsync(cancellationToken);
    }
}
