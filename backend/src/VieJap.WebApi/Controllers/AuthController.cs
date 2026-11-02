using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VieJap.Application.Common.Interfaces;
using VieJap.Application.Common.Models;
using VieJap.Application.Features.Auth.Commands.Login;
using VieJap.Application.Features.Auth.Commands.Register;
using VieJap.Domain.Entities;

namespace VieJap.WebApi.Controllers;

public record LoginRequest(
    string UsernameOrEmail,
    string Password
);

public record RegisterRequest(
    string Username,
    string Email,
    string FullName,
    string Password,
    string RegistrationCode
);

public class AuthController : BaseApiController
{
    private readonly ICurrentUserService _currentUserService;

    public AuthController(ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Đăng nhập bằng Tên đăng nhập/Email và Mật khẩu.
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.UsernameOrEmail) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Vui lòng nhập đầy đủ tài khoản và mật khẩu." });
        }

        try
        {
            var command = new LoginCommand(request.UsernameOrEmail, request.Password);
            var result = await Mediator.Send(command);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Đăng ký tài khoản học viên mới (Bắt buộc phải có Mã Code đăng ký hợp lệ).
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var command = new RegisterCommand(
                Username: request.Username,
                Email: request.Email,
                FullName: request.FullName,
                Password: request.Password,
                RegistrationCode: request.RegistrationCode
            );

            var result = await Mediator.Send(command);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Lấy thông tin tài khoản hiện tại từ JWT Token.
    /// </summary>
    [Authorize]
    [HttpGet("me")]
    public ActionResult GetCurrentUser()
    {
        return Ok(new
        {
            userId = _currentUserService.UserId,
            email = _currentUserService.Email,
            role = _currentUserService.Role,
            isAuthenticated = _currentUserService.IsAuthenticated
        });
    }
}
