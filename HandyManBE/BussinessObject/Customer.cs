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
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        public DateTime? ModifiedAtUtc { get; set; }
        public byte[] RowVersion { get; set; }


    }
}