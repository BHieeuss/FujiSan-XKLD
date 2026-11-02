using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VieJap.Application.Common.Models;
using VieJap.Application.Features.Admin.RegistrationCodes;

namespace VieJap.WebApi.Controllers.Admin;

public record CreateCodeRequest(
    string? Code,
    string? Description,
    int MaxUses = 1,
    DateTime? ExpiresAt = null
);

[Route("api/admin/registration-codes")]
public class AdminRegistrationCodesController : BaseApiController
{
    /// <summary>
    /// Lấy danh sách tất cả các mã code đăng ký trong hệ thống.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<RegistrationCodeDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<RegistrationCodeDto>>> GetCodes()
    {
        var result = await Mediator.Send(new GetRegistrationCodesAdminQuery());
        return Ok(result);
    }

    /// <summary>
    /// Tạo mã code đăng ký mới (nhập code tùy ý hoặc để trống để tự sinh chuỗi ngẫu nhiên 8 ký tự).
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(RegistrationCodeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<RegistrationCodeDto>> CreateCode([FromBody] CreateCodeRequest request)
    {
        try
        {
            var command = new CreateRegistrationCodeAdminCommand(
                Code: request.Code,
                Description: request.Description,
                MaxUses: request.MaxUses,
                ExpiresAt: request.ExpiresAt,
                CreatedBy: "Admin"
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
    /// Bật hoặc Tắt hiệu lực của mã code đăng ký.
    /// </summary>
    [HttpPut("{id:guid}/toggle-status")]
    public async Task<ActionResult> ToggleCodeStatus(Guid id)
    {
        try
        {
            var newStatus = await Mediator.Send(new ToggleRegistrationCodeStatusAdminCommand(id));
            return Ok(new { success = true, isActive = newStatus, message = newStatus ? "Đã kích hoạt mã code." : "Đã vô hiệu hóa mã code." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Xóa mã code đăng ký khỏi hệ thống.
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteCode(Guid id)
    {
        try
        {
            await Mediator.Send(new DeleteRegistrationCodeAdminCommand(id));
            return Ok(new { success = true, message = "Đã xóa mã code thành công." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
