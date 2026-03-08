using System.ComponentModel.DataAnnotations;

namespace HandyManBE.DTOs
{
    public class QuickProfileDto
    {
        [StringLength(1000)]
        public string? PhotoUrl { get; set; }

        [StringLength(500)]
        public string? ShortBio { get; set; }

        [MaxLength(3)]
        public List<string>? Skills { get; set; }
    }

    public class LoginRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }
    }

    public class RegisterCustomerRequestDto
    {
        [Required]
        [StringLength(100)]
        public string FirstName { get; set; }

        [Required]
        [StringLength(100)]
        public string LastName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [Phone]
        public string PhoneNumber { get; set; }

        [Required]
        [StringLength(200)]
        public string Password { get; set; }

        public QuickProfileDto? Profile { get; set; }
        public bool RequiresAdminPreApproval { get; set; }
    }

    public class RegisterWorkerRequestDto
    {
        [Required]
        [StringLength(100)]
        public string FirstName { get; set; }

        [Required]
        [StringLength(100)]
        public string LastName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [Phone]
        public string PhoneNumber { get; set; }
        [Range(0, 1000000)]
        public decimal HourlyRate { get; set; }

        [Required]
        public AddressDto Address { get; set; }

        [Required]
        [StringLength(200)]
        public string Password { get; set; }

        public QuickProfileDto? Profile { get; set; }
        public bool RequiresAdminPreApproval { get; set; }
    }

    public class VerifyContactRequestDto
    {
        [Required]
        public string Method { get; set; } = string.Empty;

        [Required]
        public bool Verified { get; set; }
    }

    public class AuthUserDto
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public string Name { get; set; }
    }

    public class AuthResponseDto
    {
        public string Token { get; set; }
        public AuthUserDto User { get; set; }
    }
}
