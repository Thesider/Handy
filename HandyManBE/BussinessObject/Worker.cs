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
        public virtual ICollection<WorkerService> WorkerServices { get; set; } = new List<WorkerService>();
        public int? WorkerProfileId { get; set; }
        public virtual WorkerProfile WorkerProfile { get; set; }
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        public DateTime? ModifiedAtUtc { get; set; }
    }
}