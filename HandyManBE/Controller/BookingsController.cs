using BussinessObject;
using Enums;
using HandyManBE.DTOs;
using HandyManBE.Services;
using Microsoft.AspNetCore.Mvc;
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

        public BookingsController(IBookingService bookingService)
        {
            _bookingService = bookingService;
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
            var updated = await _bookingService.ChangeStatusAsync(id, status);
            if (!updated)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _bookingService.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}
