using Enums;

namespace BussinessObject
{
    public class WorkerAvailabilitySlot
    {
        public int WorkerAvailabilitySlotId { get; set; }
        public int WorkerId { get; set; }
        public DateTimeOffset StartAt { get; set; }
        public DateTimeOffset EndAt { get; set; }
        public AvailabilityUnit Unit { get; set; } = AvailabilityUnit.Hourly;
        public virtual Worker? Worker { get; set; }
    }
}
