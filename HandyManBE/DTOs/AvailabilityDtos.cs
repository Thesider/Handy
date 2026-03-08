using Enums;
using System.ComponentModel.DataAnnotations;

namespace HandyManBE.DTOs
{
    public class WorkerAvailabilityCreateDto
    {
        [Range(1, int.MaxValue)]
        public int WorkerId { get; set; }

        [Required]
        public DateTimeOffset StartAt { get; set; }

        [Required]
        public DateTimeOffset EndAt { get; set; }

        [Required]
        public AvailabilityUnit Unit { get; set; }
    }

    public class WorkerAvailabilityDto
    {
        public int WorkerAvailabilitySlotId { get; set; }
        public int WorkerId { get; set; }
        public DateTimeOffset StartAt { get; set; }
        public DateTimeOffset EndAt { get; set; }
        public AvailabilityUnit Unit { get; set; }
    }
}
