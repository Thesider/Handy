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
            var created = await _jobGigService.CreateAsync(DtoMapper.ToEntity(dto));
            // Re-fetch to include customer info
            var result = await _jobGigService.GetByIdAsync(created.JobGigId);
            return CreatedAtAction(nameof(GetById), new { id = result.JobGigId }, DtoMapper.ToDto(result));
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
