using System;
using Enums;

namespace BussinessObject
{
    public class Bid
    {
        public int BidId { get; set; }
        public int JobGigId { get; set; }
        public int WorkerId { get; set; }
        public decimal Amount { get; set; }
        public string Message { get; set; }
        public WorkerResponseType ResponseType { get; set; } = WorkerResponseType.Offer;
        public int? EstimatedArrivalMinutes { get; set; }
        public decimal? EstimatedDurationHours { get; set; }
        public bool IsAccepted { get; set; } = false;
        public DateTime CreatedAtUtc { get; set; }

        public virtual JobGig JobGig { get; set; }
        public virtual Worker Worker { get; set; }
    }
}
