using VieJap.Domain.Entities;

namespace VieJap.Application.Common.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(User user);
}
