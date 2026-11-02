using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VieJap.Application.Common.Models;
using VieJap.Application.Features.Admin.Users;

namespace VieJap.WebApi.Controllers.Admin;

public record ResetPasswordRequest(string NewPassword);

[Route("api/admin/users")]
public class AdminUsersController : BaseApiController
{
    /// <summary>
    /// Lấy danh sách toàn bộ người dùng và học viên trong hệ thống.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<UserProfileDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<UserProfileDto>>> GetUsers()
    {
        var result = await Mediator.Send(new GetUsersAdminQuery());
        return Ok(result);
    }

    /// <summary>
    /// Khóa hoặc Mở khóa tài khoản người dùng.
    /// </summary>
    [HttpPut("{id:guid}/toggle-status")]
    public async Task<ActionResult> ToggleUserStatus(Guid id)
    {
        try
        {
            var newStatus = await Mediator.Send(new ToggleUserStatusAdminCommand(id));
            return Ok(new { success = true, isActive = newStatus, message = newStatus ? "Đã kích hoạt tài khoản." : "Đã khóa tài khoản." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Đặt lại mật khẩu mới cho người dùng.
    /// </summary>
    [HttpPost("{id:guid}/reset-password")]
    public async Task<ActionResult> ResetPassword(Guid id, [FromBody] ResetPasswordRequest request)
    {
        try
        {
            await Mediator.Send(new ResetUserPasswordAdminCommand(id, request.NewPassword));
            return Ok(new { success = true, message = "Đã cập nhật mật khẩu mới thành công." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Xóa tài khoản người dùng khỏi hệ thống.
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteUser(Guid id)
    {
        try
        {
            await Mediator.Send(new DeleteUserAdminCommand(id));
            return Ok(new { success = true, message = "Đã xóa người dùng thành công." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
