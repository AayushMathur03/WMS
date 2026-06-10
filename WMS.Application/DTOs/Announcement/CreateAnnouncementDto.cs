using System.ComponentModel.DataAnnotations;

namespace WMS.Application.DTOs.Announcement
{
    public class CreateAnnouncementDto
    {
        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Message { get; set; } = string.Empty;

        [Required]
        public int CreatedBy { get; set; }
    }
}
