using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Application.DTOs.Leave;
using WMS.Application.Services.Interfaces;

namespace WMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LeaveController : ControllerBase
    {
        private readonly ILeaveService _leaveService;

        public LeaveController(ILeaveService leaveService)
        {
            _leaveService = leaveService;
        }

        [HttpPost("apply")]
        public async Task<IActionResult> Apply([FromBody] ApplyLeaveDto dto)
            => Ok(await _leaveService.ApplyAsync(dto));

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateLeaveStatusDto dto)
        {
            var result = await _leaveService.UpdateStatusAsync(id, dto);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPut("{id}/cancel/{empId}")]
        public async Task<IActionResult> Cancel(int id, int empId)
        {
            var result = await _leaveService.CancelAsync(id, empId);
            return result ? NoContent() : NotFound();
        }

        [HttpGet("employee/{empId}")]
        public async Task<IActionResult> GetByEmployee(int empId)
            => Ok(await _leaveService.GetByEmployeeAsync(empId));

        [HttpGet("pending")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetPending()
            => Ok(await _leaveService.GetPendingAsync());
    }
}
