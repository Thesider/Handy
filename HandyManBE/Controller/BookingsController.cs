using BussinessObject;
using Enums;
using HandyManBE.Data;
using HandyManBE.DTOs;
using HandyManBE.Hubs;
using HandyManBE.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Validate;

namespace HandyManBE.Controller
{
    [ApiController]
    [Route("api/bookings")]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<BookingsController> _logger;
        private readonly IHubContext<MarketplaceHub> _hubContext;

        public BookingsController(IBookingService bookingService, ApplicationDbContext dbContext, ILogger<BookingsController> logger, IHubContext<MarketplaceHub> hubContext)
        {
            _bookingService = bookingService;
            _dbContext = dbContext;
            _logger = logger;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<ActionResult<List<BookingDto>>> GetAll()
        {
            var bookings = await _bookingService.GetAllAsync();
            return Ok(bookings.Select(DtoMapper.ToDto).ToList());
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<BookingDto>> GetById(int id)
        {
            var booking = await _bookingService.GetByIdAsync(id);
            if (booking == null)
            {
                return NotFound();
            }

            return Ok(DtoMapper.ToDto(booking));
        }

        [HttpGet("by-customer/{customerId:int}")]
        public async Task<ActionResult<List<BookingDto>>> GetByCustomer(int customerId)
        {
            var bookings = await _bookingService.GetByCustomerIdAsync(customerId);
            return Ok(bookings.Select(DtoMapper.ToDto).ToList());
        }

        [HttpGet("by-worker/{workerId:int}")]
        public async Task<ActionResult<List<BookingDto>>> GetByWorker(int workerId)
        {
            var bookings = await _bookingService.GetByWorkerIdAsync(workerId);
            return Ok(bookings.Select(DtoMapper.ToDto).ToList());
        }

        [HttpGet("by-service/{serviceId:int}")]
        public async Task<ActionResult<List<BookingDto>>> GetByService(int serviceId)
        {
            var bookings = await _bookingService.GetByServiceIdAsync(serviceId);
            return Ok(bookings.Select(DtoMapper.ToDto).ToList());
        }

        [HttpPost]
        public async Task<ActionResult<BookingDto>> Create(BookingCreateUpdateDto booking)
        {
            try
            {
                var created = await _bookingService.CreateAsync(DtoMapper.ToEntity(booking));
                LogEmailNotification(created.BookingId, "created");
                await NotifyBookingEvent(created.BookingId, "booking-created");
                return CreatedAtAction(nameof(GetById), new { id = created.BookingId }, DtoMapper.ToDto(created));
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { errors = ex.Errors });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, BookingCreateUpdateDto booking)
        {
            try
            {
                var updated = await _bookingService.UpdateAsync(id, DtoMapper.ToEntity(booking, id));
                if (!updated)
                {
                    return NotFound();
                }

                await NotifyBookingEvent(id, "booking-updated");

                return NoContent();
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { errors = ex.Errors });
            }
        }

        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> ChangeStatus(int id, [FromBody] BookingStatus status)
        {
            try
            {
                var updated = await _bookingService.ChangeStatusAsync(id, status);
                if (!updated)
                {
                    return NotFound();
                }

                await NotifyBookingEvent(id, "booking-status-changed");

                return NoContent();
            }
            catch (System.InvalidOperationException ex)
            {
                return BadRequest(new { errors = new[] { ex.Message } });
            }
        }

        [HttpPut("{id:int}/worker-accept")]
        public async Task<IActionResult> WorkerAccept(int id)
        {
            var result = await ChangeStatus(id, BookingStatus.WorkerAccepted);
            if (result is NoContentResult)
            {
                var booking = await _dbContext.Bookings.AsNoTracking().FirstOrDefaultAsync(b => b.BookingId == id);
                if (booking != null)
                {
                    await SendUserAlert(
                        booking.CustomerId,
                        "Worker accepted your job",
                        "Your worker accepted this booking. You can start chatting now.",
                        "worker-accepted",
                        new { bookingId = booking.BookingId });

                    await SendUserAlert(
                        booking.WorkerId,
                        "Job accepted",
                        "You accepted this booking. Coordinate with customer via chat.",
                        "job-accepted",
                        new { bookingId = booking.BookingId });
                }
            }

            return result;
        }

        [HttpPut("{id:int}/customer-confirm")]
        public async Task<IActionResult> CustomerConfirm(int id)
        {
            var result = await ChangeStatus(id, BookingStatus.CustomerConfirmed);
            if (result is NoContentResult)
            {
                var booking = await _dbContext.Bookings.AsNoTracking().FirstOrDefaultAsync(b => b.BookingId == id);
                if (booking != null)
                {
                    await SendUserAlert(
                        booking.WorkerId,
                        "Customer confirmed booking",
                        "Customer confirmed. You can proceed and chat for details.",
                        "customer-confirmed",
                        new { bookingId = booking.BookingId });
                }
            }

            return result;
        }

        [HttpPut("{id:int}/start")]
        public async Task<IActionResult> StartWork(int id)
        {
            var result = await ChangeStatus(id, BookingStatus.InProgress);
            if (result is NoContentResult)
            {
                var booking = await _dbContext.Bookings.AsNoTracking().FirstOrDefaultAsync(b => b.BookingId == id);
                if (booking != null)
                {
                    await SendUserAlert(booking.CustomerId, "Work started", "Worker marked this booking as in progress.", "work-started", new { bookingId = booking.BookingId });
                    await SendUserAlert(booking.WorkerId, "Work started", "You marked this booking as in progress.", "work-started", new { bookingId = booking.BookingId });
                }
            }

            return result;
        }

        [HttpPut("{id:int}/complete")]
        public async Task<IActionResult> Complete(int id)
        {
            var result = await ChangeStatus(id, BookingStatus.Completed);
            if (result is NoContentResult)
            {
                LogEmailNotification(id, "completed");
                await NotifyBookingEvent(id, "booking-completed");

                var booking = await _dbContext.Bookings.AsNoTracking().FirstOrDefaultAsync(b => b.BookingId == id);
                if (booking != null)
                {
                    await SendUserAlert(booking.CustomerId, "Job completed", "Booking marked as completed. You can leave a review.", "job-completed", new { bookingId = booking.BookingId });
                    await SendUserAlert(booking.WorkerId, "Job completed", "Booking marked as completed.", "job-completed", new { bookingId = booking.BookingId });
                }
            }

            return result;
        }

        [HttpPut("{id:int}/capture-payment")]
        public async Task<IActionResult> CapturePayment(int id, CapturePaymentDto dto)
        {
            var booking = await _dbContext.Bookings.FirstOrDefaultAsync(b => b.BookingId == id);
            if (booking == null)
            {
                return NotFound();
            }

            if (booking.Status != BookingStatus.Completed)
            {
                return BadRequest(new { errors = new[] { "Payment can only be captured after booking completion." } });
            }

            booking.PaymentStatus = PaymentStatus.Captured;
            booking.PaymentCapturedAt = DateTimeOffset.UtcNow;
            booking.PaymentReference = dto.PaymentReference;
            booking.Amount = dto.FinalAmount;
            booking.ModifiedAtUtc = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();
            LogEmailNotification(id, "payment-captured");
            await NotifyBookingEvent(id, "booking-payment-captured");

            await SendUserAlert(booking.CustomerId, "Payment captured", "Payment for this booking has been captured.", "payment-captured", new { bookingId = booking.BookingId });
            await SendUserAlert(booking.WorkerId, "Payment captured", "Payment for this booking has been captured.", "payment-captured", new { bookingId = booking.BookingId });
            return NoContent();
        }

        [HttpPost("{id:int}/send-reminder")]
        public async Task<IActionResult> SendReminder(int id)
        {
            var exists = await _dbContext.Bookings.AnyAsync(b => b.BookingId == id);
            if (!exists)
            {
                return NotFound();
            }

            LogEmailNotification(id, "reminder");
            await NotifyBookingEvent(id, "booking-reminder");
            return Accepted(new { message = "Reminder notification queued." });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _bookingService.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound();
            }

            await _hubContext.Clients.Group($"booking-{id}").SendAsync("BookingEvent", new
            {
                bookingId = id,
                eventType = "booking-deleted"
            });

            return NoContent();
        }

        private void LogEmailNotification(int bookingId, string eventType)
        {
            _logger.LogInformation("Email notification for booking {BookingId}: {EventType}", bookingId, eventType);
        }

        private async Task NotifyBookingEvent(int bookingId, string eventType)
        {
            var booking = await _dbContext.Bookings
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);

            if (booking == null)
            {
                return;
            }

            var payload = new
            {
                bookingId = booking.BookingId,
                booking.Status,
                booking.Price,
                booking.Amount,
                booking.PaymentStatus,
                eventType
            };

            await _hubContext.Clients.Group($"booking-{booking.BookingId}").SendAsync("BookingEvent", payload);
            await _hubContext.Clients.Group($"user-{booking.CustomerId}").SendAsync("BookingEvent", payload);
            await _hubContext.Clients.Group($"user-{booking.WorkerId}").SendAsync("BookingEvent", payload);
        }

        private Task SendUserAlert(int userId, string title, string message, string alertType, object meta)
        {
            return _hubContext.Clients.Group($"user-{userId}").SendAsync("UserAlert", new
            {
                title,
                message,
                alertType,
                meta,
                createdAt = DateTimeOffset.UtcNow
            });
        }
    }
}
