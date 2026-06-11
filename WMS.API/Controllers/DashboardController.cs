using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WMS.Application.DTOs.Dashboard;
using WMS.Infrastructure.Data;

namespace WMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly WmsDbContext _context;

        public DashboardController(WmsDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var today = DateTime.Today;

            var summary = new DashboardSummaryDto
            {
                TotalEmployees = await _context.Employees.CountAsync(),
                ActiveEmployees = await _context.Employees.CountAsync(e => e.Status == "Active"),
                TodayCheckIns = await _context.Attendances.CountAsync(a => a.AttendanceDate == today),
                PendingLeaves = await _context.Leaves.CountAsync(l => l.Status == "Pending"),
                ActiveProjects = await _context.Projects.CountAsync(p => p.Status == "Active"),
                TotalDepartments = await _context.Departments.CountAsync(),
                TotalClients = await _context.Clients.CountAsync(c => c.Status == true)
            };

            return Ok(summary);
        }
    }
}
