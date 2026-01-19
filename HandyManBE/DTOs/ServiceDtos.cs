using System.ComponentModel.DataAnnotations;

namespace HandyManBE.DTOs
{
    public class ServiceCreateUpdateDto
    {
        [Required]
        [StringLength(200)]
        public string ServiceName { get; set; }

        [Range(0, 1000000)]
        public decimal ServiceFee { get; set; }

        [Range(0, 1000000)]
        public decimal MinPrice { get; set; }

        [Range(0, 1000000)]
        public decimal MaxPrice { get; set; }

        [Range(0, int.MaxValue)]
        public int TotalJobs { get; set; }
    }

    public class ServiceDto
    {
        public int ServiceId { get; set; }
        public int TotalJobs { get; set; }
        public string ServiceName { get; set; }
        public decimal ServiceFee { get; set; }
        public decimal MinPrice { get; set; }
        public decimal MaxPrice { get; set; }
    }
}
