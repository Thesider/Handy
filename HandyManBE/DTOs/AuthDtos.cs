using System.ComponentModel.DataAnnotations;

namespace HandyManBE.DTOs
{
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

        [Range(0, 100)]
        public int YearsOfExperience { get; set; }

        [Range(0, 1000000)]
        public decimal HourlyRate { get; set; }

        [Required]
        public AddressDto Address { get; set; }

        [Required]
        [StringLength(200)]
        public string Password { get; set; }
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
