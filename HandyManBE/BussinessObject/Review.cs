namespace BussinessObject
{
    public class Review
    {
        public int ReviewId { get; set; }
        // 1..5
        public int Rating { get; set; }
        public string Comment { get; set; }

        // Foreign keys for easier querying
        public int CustomerId { get; set; }
        public int WorkerId { get; set; }

        // navigation properties
        public virtual Worker Worker { get; set; }
        public virtual Customer Customer { get; set; }

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    }
}