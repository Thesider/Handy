using BussinessObject;
using Enums;
using HandyManBE.Data;
using HandyManBE.DTOs;
using HandyManBE.Hubs;
using HandyManBE.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
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
        private readonly ApplicationDbContext _dbContext;
        private readonly IHubContext<MarketplaceHub> _hubContext;

        public JobGigsController(IJobGigService jobGigService, ApplicationDbContext dbContext, IHubContext<MarketplaceHub> hubContext)
        {
            _jobGigService = jobGigService;
            _dbContext = dbContext;
            _hubContext = hubContext;
        }

        [HttpGet("micro-job-templates")]
        public IActionResult GetMicroJobTemplates()
        {
            return Ok(new[]
            {
                "moving",
                "assembly",
                "tutoring"
            });
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

                if (dto.IsMicroJob && (dto.EstimatedHours < 1 || dto.EstimatedHours > 4))
                {
                    return BadRequest(new { error = "Micro-jobs must be between 1 and 4 hours." });
                }

                if (dto.Price < 0)
                {
                    return BadRequest(new { error = "Price must be >= 0." });
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
            if (dto.ResponseType == WorkerResponseType.Accept && dto.Amount <= 0)
            {
                return BadRequest(new { error = "Accept response requires a valid amount." });
            }

            var created = await _jobGigService.AddBidAsync(DtoMapper.ToEntity(dto));
            var createdDto = DtoMapper.ToDto(created);

            var gig = await _dbContext.JobGigs
                .AsNoTracking()
                .FirstOrDefaultAsync(g => g.JobGigId == created.JobGigId);

            if (gig != null)
            {
                var payload = new
                {
                    jobGigId = gig.JobGigId,
                    response = createdDto,
                    eventType = "worker-response"
                };

                await _hubContext.Clients.Group($"user-{gig.CustomerId}").SendAsync("JobGigEvent", payload);
                await _hubContext.Clients.Group($"user-{created.WorkerId}").SendAsync("JobGigEvent", payload);

                var verb = createdDto.ResponseType switch
                {
                    WorkerResponseType.Accept => "accepted",
                    WorkerResponseType.AskQuestion => "asked a question",
                    _ => "sent an offer"
                };

                await _hubContext.Clients.Group($"user-{gig.CustomerId}").SendAsync("UserAlert", new
                {
                    title = "Worker response",
                    message = $"A worker {verb} on your job '{gig.Title}'.",
                    alertType = "worker-response",
                    meta = new { jobGigId = gig.JobGigId, responseType = createdDto.ResponseType.ToString() },
                    createdAt = DateTimeOffset.UtcNow
                });
            }

            return Ok(createdDto);
        }

        [HttpPost("responses")]
        public Task<ActionResult<BidDto>> AddResponse(BidCreateDto dto)
        {
            return AddBid(dto);
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
