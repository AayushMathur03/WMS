using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Application.DTOs.Attendance;
using WMS.Application.Services.Interfaces;

namespace WMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceService _attendanceService;

        public AttendanceController(IAttendanceService attendanceService)
        {
            _attendanceService = attendanceService;
        }

        [HttpPost("checkin")]
        public async Task<IActionResult> CheckIn([FromBody] CheckInDto dto)
            => Ok(await _attendanceService.CheckInAsync(dto));

        [HttpPut("checkout/{empId}")]
        public async Task<IActionResult> CheckOut(int empId)
        {
            var result = await _attendanceService.CheckOutAsync(empId);
            return result == null ? NotFound(new { message = "No check-in found for today." }) : Ok(result);
        }

        [HttpGet("monthly/{empId}")]
        public async Task<IActionResult> GetMonthly(int empId, [FromQuery] int month, [FromQuery] int year)
            => Ok(await _attendanceService.GetMonthlyAsync(empId, month, year));
    }
}
