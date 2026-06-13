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

            // Execute all counts in a single round-trip query projected via an always-seeded table (Roles)
            var summary = await _context.Roles
                .Take(1)
                .Select(_ => new DashboardSummaryDto
                {
                    TotalEmployees = _context.Employees.Count(),
                    ActiveEmployees = _context.Employees.Count(e => e.Status == "Active"),
                    TodayCheckIns = _context.Attendances.Count(a => a.AttendanceDate == today),
                    PendingLeaves = _context.Leaves.Count(l => l.Status == "Pending"),
                    ActiveProjects = _context.Projects.Count(p => p.Status == "Active"),
                    TotalDepartments = _context.Departments.Count(),
                    TotalClients = _context.Clients.Count(c => c.Status == true)
                })
                .FirstOrDefaultAsync();

            return Ok(summary ?? new DashboardSummaryDto());
        }
    }
}
