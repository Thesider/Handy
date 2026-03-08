using System.ComponentModel.DataAnnotations;
using Enums;

namespace HandyManBE.DTOs
{
    public class CustomerCreateUpdateDto
    {
        [Required]
        [StringLength(100)]
        public string FirstName { get; set; }

        [Required]
        [StringLength(100)]
        public string LastName { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string Email { get; set; }

        [Required]
        [Phone]
        [StringLength(30)]
        public string PhoneNumber { get; set; }

        [StringLength(200)]
        public string? Password { get; set; }

        [StringLength(1000)]
        public string? ProfileImageUrl { get; set; }
        [StringLength(500)]
        public string? Bio { get; set; }
        [StringLength(200)]
        public string? SkillsCsv { get; set; }
        public bool RequiresAdminPreApproval { get; set; }
    }

    public class CustomerDto
    {
        public int CustomerId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string? Bio { get; set; }
        public string? SkillsCsv { get; set; }
        public bool IsEmailVerified { get; set; }
        public bool IsPhoneVerified { get; set; }
        public VerificationStatus IdVerificationStatus { get; set; }
        public bool RequiresAdminPreApproval { get; set; }
        public bool IsApprovedByAdmin { get; set; }
        public bool IsBlocked { get; set; }
    }
}
