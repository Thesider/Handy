using BussinessObject;
using Enums;
using HandyManBE.DAO;
using System.Collections.Generic;
using System.Threading.Tasks;
using Validate;

namespace HandyManBE.Services
{
    public class BookingAppService : IBookingService
    {
        private readonly IBookingDao _dao;

        public BookingAppService(IBookingDao dao)
        {
            _dao = dao;
        }

        public Task<List<Booking>> GetAllAsync() => _dao.GetAllAsync();

        public Task<Booking?> GetByIdAsync(int id) => _dao.GetByIdAsync(id);

        public Task<List<Booking>> GetByCustomerIdAsync(int customerId) => _dao.GetByCustomerIdAsync(customerId);

        public Task<List<Booking>> GetByWorkerIdAsync(int workerId) => _dao.GetByWorkerIdAsync(workerId);

        public Task<List<Booking>> GetByServiceIdAsync(int serviceId) => _dao.GetByServiceIdAsync(serviceId);

        public Task<Booking> CreateAsync(Booking booking)
        {
            var errors = ValidationRules.ValidateBooking(booking);
            if (errors.Count > 0) throw new ValidationException(errors);

            return _dao.CreateAsync(booking);
        }

        public Task<bool> UpdateAsync(int id, Booking booking)
        {
            if (id != booking.BookingId)
            {
                throw new ValidationException(new[] { "BookingId mismatch." });
            }

            var errors = ValidationRules.ValidateBooking(booking);
            if (errors.Count > 0) throw new ValidationException(errors);

            return _dao.UpdateAsync(id, booking);
        }

        public Task<bool> ChangeStatusAsync(int id, BookingStatus newStatus)
        {
            return _dao.ChangeStatusAsync(id, newStatus);
        }

        public Task<bool> DeleteAsync(int id) => _dao.DeleteAsync(id);
    }
}
