using System.ComponentModel.DataAnnotations;

namespace WMS.Application.DTOs.Announcement
{
    public class AnnouncementDto
    {
        public int AnnouncementId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Message { get; set; } = string.Empty;

        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public bool IsActive { get; set; }
    }
}
