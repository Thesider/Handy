using System.ComponentModel.DataAnnotations;

namespace HandyManBE.DTOs
{
    public class WorkerSearchQueryDto
    {
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }

        [Range(0, 1000)]
        public decimal? MaxDistanceKm { get; set; }

        [Range(0, 5)]
        public decimal? MinRating { get; set; }

        [Range(0, 1000000)]
        public decimal? MaxPrice { get; set; }

        [Range(0, 1000000)]
        public decimal? MinPrice { get; set; }
    }

    public class WorkerSearchResultDto : WorkerDto
    {
        public decimal? DistanceKm { get; set; }
    }

    public class WorkerAcceptanceMetricsDto
    {
        public int WorkerId { get; set; }
        public int TotalResponses { get; set; }
        public int AcceptedResponses { get; set; }
        public decimal ResponseAcceptanceRatePercent { get; set; }
        public int AssignedBookings { get; set; }
        public int AcceptedBookings { get; set; }
        public decimal BookingAcceptanceRatePercent { get; set; }
        public double AverageResponseTimeMinutes { get; set; }
        public double MedianResponseTimeMinutes { get; set; }
    }
}
