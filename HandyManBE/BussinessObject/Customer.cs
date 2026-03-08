using Enums;

namespace BussinessObject
{
    public class Customer
    {
        public int CustomerId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public byte[] Password { get; set; }
        public string PhoneNumber { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string? Bio { get; set; }
        public string? SkillsCsv { get; set; }
        public bool IsEmailVerified { get; set; }
        public bool IsPhoneVerified { get; set; }
        public VerificationStatus IdVerificationStatus { get; set; } = VerificationStatus.Unverified;
        public bool RequiresAdminPreApproval { get; set; }
        public bool IsApprovedByAdmin { get; set; } = true;
        public bool IsBlocked { get; set; }
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        public DateTime? ModifiedAtUtc { get; set; }
        public byte[] RowVersion { get; set; }

    }
}