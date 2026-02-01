using BussinessObject;
using Enums;
using HandyManBE.DTOs;
using HandyManBE.Services;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HandyManBE.Controller
{
    [ApiController]
    [Route("api/job-gigs")]
    public class JobGigsController : ControllerBase
    {
        private readonly IJobGigService _jobGigService;

        public JobGigsController(IJobGigService jobGigService)
        {
            _jobGigService = jobGigService;
        }

        [HttpGet]
        public async Task<ActionResult<List<JobGigDto>>> GetAll()
        {
            var gigs = await _jobGigService.GetAllAsync();
            return Ok(gigs.Select(DtoMapper.ToDto).ToList());
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<JobGigDto>> GetById(int id)
        {
            var gig = await _jobGigService.GetByIdAsync(id);
            if (gig == null) return NotFound();
            return Ok(DtoMapper.ToDto(gig));
        }

        [HttpGet("by-customer/{customerId:int}")]
        public async Task<ActionResult<List<JobGigDto>>> GetByCustomer(int customerId)
        {
            var gigs = await _jobGigService.GetByCustomerIdAsync(customerId);
            return Ok(gigs.Select(DtoMapper.ToDto).ToList());
        }

        [HttpPost]
        public async Task<ActionResult<JobGigDto>> Create(JobGigCreateDto dto)
        {
            try
            {
                // Validate the DTO
                if (string.IsNullOrWhiteSpace(dto.Title))
                {
                    return BadRequest(new { error = "Title is required" });
                }

                if (dto.Budget <= 0)
                {
                    return BadRequest(new { error = "Budget must be greater than 0" });
                }

                if (dto.ServiceId <= 0)
                {
                    return BadRequest(new { error = "ServiceId is required" });
                }

                if (dto.CustomerId <= 0)
                {
                    return BadRequest(new { error = "CustomerId is required" });
                }

                Console.WriteLine($"Creating job gig - Title: {dto.Title}, Work Location: {dto.Address.Street}, {dto.Address.City}");

                var created = await _jobGigService.CreateAsync(DtoMapper.ToEntity(dto));
                
                Console.WriteLine($"Job gig created successfully with ID: {created.JobGigId}");
                
                // Re-fetch to include customer info
                var result = await _jobGigService.GetByIdAsync(created.JobGigId);
                return CreatedAtAction(nameof(GetById), new { id = result.JobGigId }, DtoMapper.ToDto(result));
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException dbEx)
            {
                // Database-specific errors
                Console.WriteLine($"Database error creating job gig: {dbEx.Message}");
                Console.WriteLine($"Inner exception: {dbEx.InnerException?.Message}");
                Console.WriteLine($"Stack trace: {dbEx.StackTrace}");
                
                var errorMessage = dbEx.InnerException?.Message ?? dbEx.Message;
                if (errorMessage.Contains("FK_") || errorMessage.Contains("FOREIGN KEY"))
                {
                    return BadRequest(new { error = "Invalid CustomerId or ServiceId. Please ensure the customer and service exist." });
                }
                
                return StatusCode(500, new { error = "Database error occurred", details = errorMessage });
            }
            catch (Exception ex)
            {
                // Log the full exception details
                Console.WriteLine($"Error creating job gig: {ex.Message}");
                Console.WriteLine($"Inner exception: {ex.InnerException?.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { error = ex.Message, innerError = ex.InnerException?.Message, type = ex.GetType().Name });
            }
        }

        [HttpPost("bids")]
        public async Task<ActionResult<BidDto>> AddBid(BidCreateDto dto)
        {
            var created = await _jobGigService.AddBidAsync(DtoMapper.ToEntity(dto));
            return Ok(DtoMapper.ToDto(created));
        }

        [HttpPut("{id:int}/accept-bid/{bidId:int}")]
        public async Task<IActionResult> AcceptBid(int id, int bidId)
        {
            var success = await _jobGigService.AcceptBidAsync(id, bidId);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> ChangeStatus(int id, [FromBody] JobGigStatus status)
        {
            var success = await _jobGigService.ChangeStatusAsync(id, status);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
