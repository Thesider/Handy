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
        public string Location { get; set; } = string.Empty;
        public JobGigStatus Status { get; set; }
        public DateTime CreatedAtUtc { get; set; }
        public int? AcceptedBidId { get; set; }

        public virtual Customer? Customer { get; set; }
        public virtual Service? Service { get; set; }
        public virtual ICollection<Bid> Bids { get; set; } = new List<Bid>();

        // Budget sẽ là giá tiền thuê 1 người
        // thêm thuế số lượng người 
        // Thêm xem thông tin nhân viên nhận việc
    }
}
