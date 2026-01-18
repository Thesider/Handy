using BussinessObject;
using Enums;
using HandyManBE.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HandyManBE.DAO
{
    public class BookingDao : IBookingDao
    {
        private readonly ApplicationDbContext _db;

        public BookingDao(ApplicationDbContext db)
        {
            _db = db;
        }

        public Task<List<Booking>> GetAllAsync()
        {
            return _db.Bookings
                .Include(b => b.Worker)
                .Include(b => b.Customer)
                .Include(b => b.Service)
                .AsNoTracking()
                .ToListAsync();
        }

        public Task<Booking?> GetByIdAsync(int id)
        {
            return _db.Bookings
                .Include(b => b.Worker)
                .Include(b => b.Customer)
                .Include(b => b.Service)
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.BookingId == id);
        }

        public Task<List<Booking>> GetByCustomerIdAsync(int customerId)
        {
            return _db.Bookings
                .Include(b => b.Worker)
                .Include(b => b.Customer)
                .Include(b => b.Service)
                .AsNoTracking()
                .Where(b => b.CustomerId == customerId)
                .ToListAsync();
        }

        public Task<List<Booking>> GetByWorkerIdAsync(int workerId)
        {
            return _db.Bookings
                .Include(b => b.Worker)
                .Include(b => b.Customer)
                .Include(b => b.Service)
                .AsNoTracking()
                .Where(b => b.WorkerId == workerId)
                .ToListAsync();
        }

        public Task<List<Booking>> GetByServiceIdAsync(int serviceId)
        {
            return _db.Bookings
                .Include(b => b.Worker)
                .Include(b => b.Customer)
                .Include(b => b.Service)
                .AsNoTracking()
                .Where(b => b.ServiceId == serviceId)
                .ToListAsync();
        }

        public async Task<Booking> CreateAsync(Booking booking)
        {
            _db.Bookings.Add(booking);
            await _db.SaveChangesAsync();
            return booking;
        }

        public async Task<bool> UpdateAsync(int id, Booking booking)
        {
            var existing = await _db.Bookings.FirstOrDefaultAsync(b => b.BookingId == id);
            if (existing == null)
            {
                return false;
            }

            _db.Entry(existing).CurrentValues.SetValues(booking);
            existing.ModifiedAtUtc = System.DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ChangeStatusAsync(int id, BookingStatus newStatus)
        {
            var existing = await _db.Bookings.FirstOrDefaultAsync(b => b.BookingId == id);
            if (existing == null)
            {
                return false;
            }

            existing.ChangeStatus(newStatus);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _db.Bookings.FirstOrDefaultAsync(b => b.BookingId == id);
            if (existing == null)
            {
                return false;
            }

            _db.Bookings.Remove(existing);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
