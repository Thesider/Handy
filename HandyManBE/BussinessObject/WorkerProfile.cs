namespace BussinessObject
{
    public class WorkerProfile
    {
        public int WorkerProfileId { get; set; }
        public int WorkerId { get; set; }

        public string Bio { get; set; }
        public string Skills { get; set; }
        public string Certifications { get; set; }
        public string ProfileImageUrl { get; set; }

        public virtual Worker Worker { get; set; }

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        public DateTime? ModifiedAtUtc { get; set; }
    }
}
