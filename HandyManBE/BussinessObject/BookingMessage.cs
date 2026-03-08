namespace BussinessObject
{
    public class BookingMessage
    {
        public int BookingMessageId { get; set; }
        public int BookingId { get; set; }
        public string SenderRole { get; set; } = string.Empty;
        public int SenderId { get; set; }
        public string Text { get; set; } = string.Empty;
        public DateTimeOffset SentAt { get; set; } = DateTimeOffset.UtcNow;
        public virtual Booking? Booking { get; set; }
    }
}
