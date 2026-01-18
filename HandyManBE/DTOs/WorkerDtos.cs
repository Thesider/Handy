using System.ComponentModel.DataAnnotations;

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

        [Range(0, 100)]
        public int YearsOfExperience { get; set; } = 0;

        public bool IsAvailable { get; set; } = false;

        [Range(0, 1000000)]
        public decimal HourlyRate { get; set; }

        [Range(0, 5)]
        public decimal Rating { get; set; }

        [Required]
        public AddressDto Address { get; set; }

        public int? WorkerProfileId { get; set; }
    }

    public class WorkerDto
    {
        public int WorkerId { get; set; }
        public int YearsOfExperience { get; set; }
        public bool IsAvailable { get; set; }
        public decimal HourlyRate { get; set; }
        public decimal Rating { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public AddressDto Address { get; set; }
        public int? WorkerProfileId { get; set; }
    }
}
