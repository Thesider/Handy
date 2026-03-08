using System.ComponentModel.DataAnnotations;

namespace HandyManBE.DTOs
{
    public class BookingMessageCreateDto
    {
        [Range(1, int.MaxValue)]
        public int BookingId { get; set; }

        [Required]
        [StringLength(20)]
        public string SenderRole { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int SenderId { get; set; }

        [Required]
        [StringLength(2000)]
        public string Text { get; set; } = string.Empty;
    }

    public class BookingMessageDto
    {
        public int BookingMessageId { get; set; }
        public int BookingId { get; set; }
        public string SenderRole { get; set; } = string.Empty;
        public int SenderId { get; set; }
        public string Text { get; set; } = string.Empty;
        public DateTimeOffset SentAt { get; set; }
    }
}
