using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WMS.Application.DTOs.Announcement;
using WMS.Domain.Entities;
using WMS.Domain.Interfaces;

namespace WMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AnnouncementController : ControllerBase
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public AnnouncementController(IUnitOfWork uow, IMapper mapper)
        {
            _uow = uow;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var announcements = await _uow.Announcements.GetAllAsync();
            return Ok(_mapper.Map<IEnumerable<AnnouncementDto>>(announcements));
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActive()
        {
            var announcements = await _uow.Announcements.GetAllAsync();
            var active = announcements.Where(a => a.IsActive);
            return Ok(_mapper.Map<IEnumerable<AnnouncementDto>>(active));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var announcement = await _uow.Announcements.GetByIdAsync(id);
            return announcement == null ? NotFound() : Ok(_mapper.Map<AnnouncementDto>(announcement));
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateAnnouncementDto dto)
        {
            var announcement = _mapper.Map<Announcement>(dto);
            await _uow.Announcements.AddAsync(announcement);
            await _uow.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = announcement.AnnouncementId }, _mapper.Map<AnnouncementDto>(announcement));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateAnnouncementDto dto)
        {
            var announcement = await _uow.Announcements.GetByIdAsync(id);
            if (announcement == null) return NotFound();
            announcement.Title = dto.Title;
            announcement.Message = dto.Message;
            await _uow.Announcements.UpdateAsync(announcement);
            await _uow.SaveChangesAsync();
            return Ok(_mapper.Map<AnnouncementDto>(announcement));
        }

        [HttpPut("{id}/deactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Deactivate(int id)
        {
            var announcement = await _uow.Announcements.GetByIdAsync(id);
            if (announcement == null) return NotFound();
            announcement.IsActive = false;
            await _uow.Announcements.UpdateAsync(announcement);
            await _uow.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _uow.Announcements.DeleteAsync(id);
            await _uow.SaveChangesAsync();
            return NoContent();
        }
    }
}
