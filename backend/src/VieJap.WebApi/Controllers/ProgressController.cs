using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VieJap.Application.Features.Progress.Commands.UpdateUserProgress;
using VieJap.Application.Features.Progress.DTOs;
using VieJap.Application.Features.Progress.Queries.GetUserProgress;

namespace VieJap.WebApi.Controllers;

public record UpdateUserProgressRequest(
    List<int>? LearnedItemIds,
    List<int>? ForgottenItemIds
);

[Authorize]
public class ProgressController : BaseApiController
{
    /// <summary>
    /// Lấy toàn bộ tiến độ học tập của người dùng hiện tại (dựa vào JWT Token).
    /// </summary>
    /// <returns>Dữ liệu tiến độ gồm danh sách ID bài học đã học và ID từ vựng đã quên</returns>
    [HttpGet]
    [ProducesResponseType(typeof(UserProgressDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserProgressDto>> GetProgress()
    {
        var result = await Mediator.Send(new GetUserProgressQuery());
        return Ok(result);
    }

    /// <summary>
    /// Cập nhật tiến độ học tập (mảng ID từ vựng đã học / đã quên).
    /// </summary>
    /// <param name="request">Chứa danh sách ID mới cần cập nhật</param>
    /// <returns>Tiến độ học tập mới nhất sau khi lưu</returns>
    [HttpPost]
    [ProducesResponseType(typeof(UserProgressDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserProgressDto>> UpdateProgress([FromBody] UpdateUserProgressRequest request)
    {
        var command = new UpdateUserProgressCommand(
            LearnedItemIds: request.LearnedItemIds,
            ForgottenItemIds: request.ForgottenItemIds
        );

        var result = await Mediator.Send(command);
        return Ok(result);
    }
}
