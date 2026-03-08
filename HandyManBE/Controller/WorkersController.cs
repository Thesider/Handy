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
    [Route("api/workers")]
    public class WorkersController : ControllerBase
    {
        private readonly IWorkerService _workerService;
        private readonly ApplicationDbContext _dbContext;

        public WorkersController(IWorkerService workerService, ApplicationDbContext dbContext)
        {
            _workerService = workerService;
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<ActionResult<List<WorkerDto>>> GetAll()
        {
            var workers = await _workerService.GetAllAsync();
            return Ok(workers.Select(DtoMapper.ToDto).ToList());
        }

        [HttpGet("search")]
        public async Task<ActionResult<List<WorkerSearchResultDto>>> Search([FromQuery] WorkerSearchQueryDto query)
        {
            var workers = await _dbContext.Workers
                .AsNoTracking()
                .Where(w => !w.IsBlocked)
                .Where(w => !w.RequiresAdminPreApproval || w.IsApprovedByAdmin)
                .Where(w => query.MinRating == null || w.Rating >= query.MinRating.Value)
                .Where(w => query.MinPrice == null || w.HourlyRate >= query.MinPrice.Value)
                .Where(w => query.MaxPrice == null || w.HourlyRate <= query.MaxPrice.Value)
                .OrderByDescending(w => w.Rating)
                .ToListAsync();

            var hasOrigin = query.Latitude.HasValue && query.Longitude.HasValue;
            var hasDistanceLimit = query.MaxDistanceKm.HasValue;

            var results = workers
                .Select(w =>
                {
                    decimal? distanceKm = null;
                    if (hasOrigin && w.Latitude.HasValue && w.Longitude.HasValue)
                    {
                        distanceKm = CalculateDistanceKm(
                            query.Latitude!.Value,
                            query.Longitude!.Value,
                            w.Latitude.Value,
                            w.Longitude.Value);
                    }

                    return new WorkerSearchResultDto
                    {
                        WorkerId = w.WorkerId,
                        IsAvailable = w.IsAvailable,
                        HourlyRate = w.HourlyRate,
                        Rating = w.Rating,
                        FirstName = w.FirstName,
                        LastName = w.LastName,
                        Email = w.Email,
                        PhoneNumber = w.PhoneNumber,
                        Latitude = w.Latitude,
                        Longitude = w.Longitude,
                        Address = DtoMapper.ToDto(w.Address),
                        WorkerProfileId = w.WorkerProfileId,
                        ProfileImageUrl = w.ProfileImageUrl,
                        Bio = w.Bio,
                        SkillsCsv = w.SkillsCsv,
                        IsEmailVerified = w.IsEmailVerified,
                        IsPhoneVerified = w.IsPhoneVerified,
                        IdVerificationStatus = w.IdVerificationStatus,
                        RequiresAdminPreApproval = w.RequiresAdminPreApproval,
                        IsApprovedByAdmin = w.IsApprovedByAdmin,
                        IsBlocked = w.IsBlocked,
                        DistanceKm = distanceKm
                    };
                })
                .Where(r => !hasDistanceLimit || (r.DistanceKm.HasValue && r.DistanceKm.Value <= query.MaxDistanceKm!.Value))
                .OrderBy(r => r.DistanceKm ?? decimal.MaxValue)
                .ThenByDescending(r => r.Rating)
                .ToList();

            return Ok(results);
        }

        [HttpGet("{workerId:int}/metrics")]
        public async Task<ActionResult<WorkerAcceptanceMetricsDto>> GetMetrics(int workerId)
        {
            var workerExists = await _dbContext.Workers.AnyAsync(w => w.WorkerId == workerId);
            if (!workerExists)
            {
                return NotFound();
            }

            var responses = await _dbContext.Bids
                .AsNoTracking()
                .Where(b => b.WorkerId == workerId)
                .Join(
                    _dbContext.JobGigs.AsNoTracking(),
                    bid => bid.JobGigId,
                    gig => gig.JobGigId,
                    (bid, gig) => new
                    {
                        bid.IsAccepted,
                        BidCreatedAtUtc = bid.CreatedAtUtc,
                        JobCreatedAtUtc = gig.CreatedAtUtc
                    })
                .ToListAsync();

            var totalResponses = responses.Count;
            var acceptedResponses = responses.Count(r => r.IsAccepted);
            var responseAcceptanceRate = totalResponses == 0 ? 0 : (decimal)acceptedResponses * 100m / totalResponses;

            var bookingStats = await _dbContext.Bookings
                .AsNoTracking()
                .Where(b => b.WorkerId == workerId)
                .ToListAsync();

            var assignedBookings = bookingStats.Count;
            var acceptedBookings = bookingStats.Count(b =>
                b.Status == BookingStatus.WorkerAccepted
                || b.Status == BookingStatus.CustomerConfirmed
                || b.Status == BookingStatus.InProgress
                || b.Status == BookingStatus.Completed);
            var bookingAcceptanceRate = assignedBookings == 0 ? 0 : (decimal)acceptedBookings * 100m / assignedBookings;

            var timeSeries = await _dbContext.Bids
                .AsNoTracking()
                .Where(b => b.WorkerId == workerId)
                .Join(
                    _dbContext.JobGigs.AsNoTracking(),
                    bid => bid.JobGigId,
                    gig => gig.JobGigId,
                    (bid, gig) => EF.Functions.DateDiffMinute(gig.CreatedAtUtc, bid.CreatedAtUtc))
                .ToListAsync();

            var validTimes = timeSeries
                .Where(m => m >= 0)
                .Select(m => (double)m)
                .OrderBy(m => m)
                .ToList();

            var avgResponse = validTimes.Count == 0 ? 0 : validTimes.Average();
            var medianResponse = validTimes.Count == 0
                ? 0
                : (validTimes.Count % 2 == 1
                    ? validTimes[validTimes.Count / 2]
                    : (validTimes[(validTimes.Count / 2) - 1] + validTimes[validTimes.Count / 2]) / 2.0);

            return Ok(new WorkerAcceptanceMetricsDto
            {
                WorkerId = workerId,
                TotalResponses = totalResponses,
                AcceptedResponses = acceptedResponses,
                ResponseAcceptanceRatePercent = decimal.Round(responseAcceptanceRate, 2),
                AssignedBookings = assignedBookings,
                AcceptedBookings = acceptedBookings,
                BookingAcceptanceRatePercent = decimal.Round(bookingAcceptanceRate, 2),
                AverageResponseTimeMinutes = Math.Round(avgResponse, 2),
                MedianResponseTimeMinutes = Math.Round(medianResponse, 2)
            });
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<WorkerDto>> GetById(int id)
        {
            var worker = await _workerService.GetByIdAsync(id);
            if (worker == null)
            {
                return NotFound();
            }

            return Ok(DtoMapper.ToDto(worker));
        }

        [HttpPost]
        public async Task<ActionResult<WorkerDto>> Create(WorkerCreateUpdateDto worker)
        {
            try
            {
                var created = await _workerService.CreateAsync(DtoMapper.ToEntity(worker));
                return CreatedAtAction(nameof(GetById), new { id = created.WorkerId }, DtoMapper.ToDto(created));
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { errors = ex.Errors });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, WorkerCreateUpdateDto worker)
        {
            try
            {
                var updated = await _workerService.UpdateAsync(id, DtoMapper.ToEntity(worker, id));
                if (!updated)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { errors = ex.Errors });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _workerService.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpGet("{workerId:int}/availability")]
        public async Task<ActionResult<List<WorkerAvailabilityDto>>> GetAvailability(int workerId)
        {
            var slots = await _dbContext.WorkerAvailabilitySlots
                .AsNoTracking()
                .Where(s => s.WorkerId == workerId)
                .OrderBy(s => s.StartAt)
                .Select(s => new WorkerAvailabilityDto
                {
                    WorkerAvailabilitySlotId = s.WorkerAvailabilitySlotId,
                    WorkerId = s.WorkerId,
                    StartAt = s.StartAt,
                    EndAt = s.EndAt,
                    Unit = s.Unit
                })
                .ToListAsync();

            return Ok(slots);
        }

        [HttpPost("{workerId:int}/availability")]
        public async Task<ActionResult<WorkerAvailabilityDto>> AddAvailability(int workerId, WorkerAvailabilityCreateDto dto)
        {
            if (workerId != dto.WorkerId)
            {
                return BadRequest(new { errors = new[] { "WorkerId mismatch." } });
            }

            if (dto.EndAt <= dto.StartAt)
            {
                return BadRequest(new { errors = new[] { "EndAt must be after StartAt." } });
            }

            var exists = await _dbContext.Workers.AnyAsync(w => w.WorkerId == workerId);
            if (!exists)
            {
                return NotFound(new { errors = new[] { "Worker not found." } });
            }

            var slot = new WorkerAvailabilitySlot
            {
                WorkerId = dto.WorkerId,
                StartAt = dto.StartAt,
                EndAt = dto.EndAt,
                Unit = dto.Unit
            };

            _dbContext.WorkerAvailabilitySlots.Add(slot);
            await _dbContext.SaveChangesAsync();

            return Ok(new WorkerAvailabilityDto
            {
                WorkerAvailabilitySlotId = slot.WorkerAvailabilitySlotId,
                WorkerId = slot.WorkerId,
                StartAt = slot.StartAt,
                EndAt = slot.EndAt,
                Unit = slot.Unit
            });
        }

        [HttpDelete("availability/{slotId:int}")]
        public async Task<IActionResult> DeleteAvailability(int slotId)
        {
            var slot = await _dbContext.WorkerAvailabilitySlots.FirstOrDefaultAsync(s => s.WorkerAvailabilitySlotId == slotId);
            if (slot == null)
            {
                return NotFound();
            }

            _dbContext.WorkerAvailabilitySlots.Remove(slot);
            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        private static decimal CalculateDistanceKm(decimal startLatitude, decimal startLongitude, decimal endLatitude, decimal endLongitude)
        {
            var radius = 6371d;

            var dLat = ToRadians((double)(endLatitude - startLatitude));
            var dLon = ToRadians((double)(endLongitude - startLongitude));

            var lat1 = ToRadians((double)startLatitude);
            var lat2 = ToRadians((double)endLatitude);

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
                    + Math.Cos(lat1) * Math.Cos(lat2)
                    * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            var distance = radius * c;

            return decimal.Round((decimal)distance, 2);
        }

        private static double ToRadians(double angle)
        {
            return Math.PI * angle / 180.0;
        }
    }
}
