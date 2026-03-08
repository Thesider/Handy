using BussinessObject;
using Enums;
using HandyManBE.Data;
using HandyManBE.DTOs;
using HandyManBE.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Validate;

namespace HandyManBE.Controller
{
    [ApiController]
    [Route("api/reviews")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;
        private readonly ApplicationDbContext _dbContext;

        public ReviewsController(IReviewService reviewService, ApplicationDbContext dbContext)
        {
            _reviewService = reviewService;
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<ActionResult<List<ReviewDto>>> GetAll()
        {
            var reviews = await _reviewService.GetAllAsync();
            return Ok(reviews.Select(DtoMapper.ToDto).ToList());
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ReviewDto>> GetById(int id)
        {
            var review = await _reviewService.GetByIdAsync(id);
            if (review == null)
            {
                return NotFound();
            }

            return Ok(DtoMapper.ToDto(review));
        }

        [HttpGet("by-worker/{workerId:int}")]
        public async Task<ActionResult<List<ReviewDto>>> GetByWorker(int workerId)
        {
            var reviews = await _reviewService.GetByWorkerIdAsync(workerId);
            return Ok(reviews.Select(DtoMapper.ToDto).ToList());
        }

        [HttpGet("by-customer/{customerId:int}")]
        public async Task<ActionResult<List<ReviewDto>>> GetByCustomer(int customerId)
        {
            var reviews = await _reviewService.GetByCustomerIdAsync(customerId);
            return Ok(reviews.Select(DtoMapper.ToDto).ToList());
        }

        [HttpPost]
        public async Task<ActionResult<ReviewDto>> Create(ReviewCreateDto review)
        {
            try
            {
                if (review.BookingId.HasValue)
                {
                    var booking = await _dbContext.Bookings
                        .AsNoTracking()
                        .FirstOrDefaultAsync(b => b.BookingId == review.BookingId.Value);

                    if (booking == null)
                    {
                        return BadRequest(new { errors = new[] { "Booking not found." } });
                    }

                    if (booking.Status != BookingStatus.Completed)
                    {
                        return BadRequest(new { errors = new[] { "Reviews can be submitted after booking completion." } });
                    }
                }

                var created = await _reviewService.CreateAsync(DtoMapper.ToEntity(review));
                return CreatedAtAction(nameof(GetById), new { id = created.ReviewId }, DtoMapper.ToDto(created));
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { errors = ex.Errors });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _reviewService.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}
