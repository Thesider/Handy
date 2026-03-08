using BussinessObject;
using HandyManBE.Data;
using HandyManBE.DTOs;
using HandyManBE.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;

namespace HandyManBE.Controller
{
    [ApiController]
    [Route("api/messages")]
    public class MessagesController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IHubContext<MarketplaceHub> _hubContext;

        public MessagesController(ApplicationDbContext dbContext, IHubContext<MarketplaceHub> hubContext)
        {
            _dbContext = dbContext;
            _hubContext = hubContext;
        }

        [HttpGet("booking/{bookingId:int}")]
        public async Task<ActionResult<List<BookingMessageDto>>> GetByBooking(int bookingId)
        {
            var exists = await _dbContext.Bookings.AnyAsync(b => b.BookingId == bookingId);
            if (!exists)
            {
                return NotFound();
            }

            var messages = await _dbContext.BookingMessages
                .AsNoTracking()
                .Where(m => m.BookingId == bookingId)
                .OrderBy(m => m.SentAt)
                .Select(m => new BookingMessageDto
                {
                    BookingMessageId = m.BookingMessageId,
                    BookingId = m.BookingId,
                    SenderRole = m.SenderRole,
                    SenderId = m.SenderId,
                    Text = m.Text,
                    SentAt = m.SentAt
                })
                .ToListAsync();

            return Ok(messages);
        }

        [HttpPost]
        public async Task<ActionResult<BookingMessageDto>> Create(BookingMessageCreateDto dto)
        {
            var hadMessages = await _dbContext.BookingMessages.AnyAsync(m => m.BookingId == dto.BookingId);

            var booking = await _dbContext.Bookings
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.BookingId == dto.BookingId);
            if (booking == null)
            {
                return BadRequest(new { errors = new[] { "Booking not found." } });
            }

            if (!dto.SenderRole.Equals("Customer", StringComparison.OrdinalIgnoreCase)
                && !dto.SenderRole.Equals("Worker", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { errors = new[] { "SenderRole must be Customer or Worker." } });
            }

            var entity = new BookingMessage
            {
                BookingId = dto.BookingId,
                SenderRole = dto.SenderRole,
                SenderId = dto.SenderId,
                Text = dto.Text,
                SentAt = DateTimeOffset.UtcNow
            };

            _dbContext.BookingMessages.Add(entity);
            await _dbContext.SaveChangesAsync();

            var payload = new
            {
                bookingId = entity.BookingId,
                message = new BookingMessageDto
                {
                    BookingMessageId = entity.BookingMessageId,
                    BookingId = entity.BookingId,
                    SenderRole = entity.SenderRole,
                    SenderId = entity.SenderId,
                    Text = entity.Text,
                    SentAt = entity.SentAt
                }
            };

            await _hubContext.Clients.Group($"booking-{entity.BookingId}").SendAsync("ChatMessage", payload);
            await _hubContext.Clients.Group($"user-{booking.CustomerId}").SendAsync("ChatMessage", payload);
            await _hubContext.Clients.Group($"user-{booking.WorkerId}").SendAsync("ChatMessage", payload);

            var senderIsCustomer = dto.SenderRole.Equals("Customer", StringComparison.OrdinalIgnoreCase);
            var receiverId = senderIsCustomer ? booking.WorkerId : booking.CustomerId;

            await _hubContext.Clients.Group($"user-{receiverId}").SendAsync("UserAlert", new
            {
                title = hadMessages ? "New message" : "Chat started",
                message = hadMessages ? "You have a new message for this booking." : "Chat has been initiated for this booking.",
                alertType = hadMessages ? "new-message" : "chat-initiated",
                meta = new { bookingId = entity.BookingId },
                createdAt = DateTimeOffset.UtcNow
            });

            return Ok(new BookingMessageDto
            {
                BookingMessageId = entity.BookingMessageId,
                BookingId = entity.BookingId,
                SenderRole = entity.SenderRole,
                SenderId = entity.SenderId,
                Text = entity.Text,
                SentAt = entity.SentAt
            });
        }
    }
}
