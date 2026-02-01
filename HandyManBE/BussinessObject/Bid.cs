using System;

namespace BussinessObject
{
    public class Bid
    {
        public int BidId { get; set; }
        public int JobGigId { get; set; }
        public int WorkerId { get; set; }
        public decimal Amount { get; set; }
        public string Message { get; set; }
        public bool IsAccepted { get; set; } = false;
        public DateTime CreatedAtUtc { get; set; }

        public virtual JobGig JobGig { get; set; }
        public virtual Worker Worker { get; set; }
    }
}
