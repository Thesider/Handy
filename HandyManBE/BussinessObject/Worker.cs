using Enums;

namespace BussinessObject
{
    public class Worker
    {
        public int WorkerId { get; set; }
        public bool IsAvailable { get; set; } = false;
        public decimal HourlyRate { get; set; }
        public decimal Rating { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public byte[] Password { get; set; }
        public Address Address { get; set; }
        public string PhoneNumber { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string? Bio { get; set; }
        public string? SkillsCsv { get; set; }
        public bool IsEmailVerified { get; set; }
        public bool IsPhoneVerified { get; set; }
        public VerificationStatus IdVerificationStatus { get; set; } = VerificationStatus.Unverified;
        public bool RequiresAdminPreApproval { get; set; }
        public bool IsApprovedByAdmin { get; set; } = true;
        public bool IsBlocked { get; set; }
        public virtual ICollection<WorkerService> WorkerServices { get; set; } = new List<WorkerService>();
        public int? WorkerProfileId { get; set; }
        public virtual WorkerProfile WorkerProfile { get; set; }
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        public DateTime? ModifiedAtUtc { get; set; }
    }
}