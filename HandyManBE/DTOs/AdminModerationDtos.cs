using Enums;
using System.ComponentModel.DataAnnotations;

namespace HandyManBE.DTOs
{
    public class AdminUserModerationUpdateDto
    {
        [Required]
        public bool IsBlocked { get; set; }

        [Required]
        public bool IsApprovedByAdmin { get; set; }

        [Required]
        public VerificationStatus IdVerificationStatus { get; set; }
    }
}
