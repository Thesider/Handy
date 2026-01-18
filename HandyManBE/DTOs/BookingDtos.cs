using Enums;
using System;
using System.ComponentModel.DataAnnotations;

namespace HandyManBE.DTOs
{
    public class BookingCreateUpdateDto
    {
        [Range(1, int.MaxValue)]
        public int CustomerId { get; set; }

        [Range(1, int.MaxValue)]
        public int WorkerId { get; set; }

        [Range(1, int.MaxValue)]
        public int ServiceId { get; set; }

        [Range(0, 1000000000)]
        public decimal MinPrice { get; set; }

        [Range(0, 1000000000)]
        public decimal MaxPrice { get; set; }

        [Required]
        public DateTimeOffset StartAt { get; set; }

        public DateTimeOffset? EndAt { get; set; }

        [Required]
        public BookingStatus Status { get; set; }

        [Range(0, 1000000000)]
        public decimal Amount { get; set; }

        [StringLength(2000)]
        public string? Notes { get; set; }
    }

    public class BookingDto
    {
        public int BookingId { get; set; }
        public int CustomerId { get; set; }
        public int WorkerId { get; set; }
        public int ServiceId { get; set; }
        public decimal MinPrice { get; set; }
        public decimal MaxPrice { get; set; }
        public DateTimeOffset StartAt { get; set; }
        public DateTimeOffset? EndAt { get; set; }
        public BookingStatus Status { get; set; }
        public decimal Amount { get; set; }
        public string? Notes { get; set; }
    }
}
