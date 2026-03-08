using System.ComponentModel.DataAnnotations;
using Enums;

namespace HandyManBE.DTOs
{
    public class WorkerCreateUpdateDto
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

        [Range(-90, 90)]
        public decimal? Latitude { get; set; }

        [Range(-180, 180)]
        public decimal? Longitude { get; set; }

        public bool IsAvailable { get; set; } = false;

        [Range(0, 1000000)]
        public decimal HourlyRate { get; set; }

        [Range(0, 5)]
        public decimal Rating { get; set; }

        [Required]
        public AddressDto Address { get; set; }

        public int? WorkerProfileId { get; set; }
        [StringLength(1000)]
        public string? ProfileImageUrl { get; set; }
        [StringLength(500)]
        public string? Bio { get; set; }
        [StringLength(200)]
        public string? SkillsCsv { get; set; }
        public bool IsEmailVerified { get; set; }
        public bool IsPhoneVerified { get; set; }
        public VerificationStatus IdVerificationStatus { get; set; }
        public bool RequiresAdminPreApproval { get; set; }
        public bool IsApprovedByAdmin { get; set; }
        public bool IsBlocked { get; set; }
    }

    public class WorkerDto
    {
        public int WorkerId { get; set; }
        public bool IsAvailable { get; set; }
        public decimal HourlyRate { get; set; }
        public decimal Rating { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public AddressDto Address { get; set; }
        public int? WorkerProfileId { get; set; }
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
