using Enums;
using Ulilities;
namespace BussinessObject
{
    public class Booking
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

        public virtual Worker Worker { get; set; }
        public virtual Customer Customer { get; set; }
        public virtual Service Service { get; set; }

        public decimal Amount { get; set; }
        public string Notes { get; set; }

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        public DateTime? ModifiedAtUtc { get; set; }
        public byte[] RowVersion { get; set; }

        public void ChangeStatus(BookingStatus newStatus)
        {
            BookingStateMachine.EnsureTransition(Status, newStatus);
            Status = newStatus;
            ModifiedAtUtc = DateTime.UtcNow;

            if (newStatus == BookingStatus.Completed && EndAt == null)
            {
                EndAt = DateTimeOffset.UtcNow;
            }
        }
    }
}