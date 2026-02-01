using System;
using System.Collections.Generic;
using Enums;

namespace HandyManBE.DTOs
{
    public class JobGigDto
    {
        public int JobGigId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Budget { get; set; }
        public int ServiceId { get; set; }
        public string ServiceType { get; set; } = string.Empty;
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public AddressDto Address { get; set; } = new AddressDto();
        public JobGigStatus Status { get; set; }
        public DateTime CreatedAtUtc { get; set; }
        // public int? AcceptedBidId { get; set; }
        public int NumWorkersRequired { get; set; }
        public int DurationDays { get; set; }
        public List<BidDto> Bids { get; set; } = new List<BidDto>();
    }

    public class BidDto
    {
        public int BidId { get; set; }
        public int JobGigId { get; set; }
        public int WorkerId { get; set; }
        public string WorkerName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Message { get; set; } = string.Empty;
        public bool IsAccepted { get; set; }
        public DateTime CreatedAtUtc { get; set; }
        public decimal WorkerRating { get; set; }
    }

    public class JobGigCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Budget { get; set; }
        public int ServiceId { get; set; }
        public int CustomerId { get; set; }
        public AddressDto Address { get; set; } = new AddressDto();
        public int NumWorkersRequired { get; set; } = 1;
        public int DurationDays { get; set; } = 1;
    }

    public class BidCreateDto
    {
        public int JobGigId { get; set; }
        public int WorkerId { get; set; }
        public decimal Amount { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
