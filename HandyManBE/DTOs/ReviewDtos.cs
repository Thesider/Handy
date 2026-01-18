using System.ComponentModel.DataAnnotations;

namespace HandyManBE.DTOs
{
    public class ReviewCreateDto
    {
        [Range(1, int.MaxValue)]
        public int CustomerId { get; set; }

        [Range(1, int.MaxValue)]
        public int WorkerId { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; }

        [Required]
        [StringLength(2000)]
        public string Comment { get; set; }
    }

    public class ReviewDto
    {
        public int ReviewId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
        public int CustomerId { get; set; }
        public int WorkerId { get; set; }
    }
}
