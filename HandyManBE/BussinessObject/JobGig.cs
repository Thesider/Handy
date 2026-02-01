using System;
using System.Collections.Generic;
using Enums;

namespace BussinessObject
{
    public class JobGig
    {
        public int JobGigId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Budget { get; set; }
        public int ServiceId { get; set; }
        public int CustomerId { get; set; }
        public virtual Address Address { get; set; } = new Address();
        public JobGigStatus Status { get; set; }
        public DateTime CreatedAtUtc { get; set; }
        public int NumWorkersRequired { get; set; } = 1;
        public int DurationDays { get; set; } = 1;
        // public int? AcceptedBidId { get; set; } // Removing in favor of tracking status on Bid side

        public virtual Customer? Customer { get; set; }
        public virtual Service? Service { get; set; }
        public virtual ICollection<Bid> Bids { get; set; } = new List<Bid>();

     
    }
}
