using BussinessObject;
using Enums;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HandyManBE.DAO
{
    public interface IBookingDao
    {
        Task<List<Booking>> GetAllAsync();
        Task<Booking?> GetByIdAsync(int id);
        Task<List<Booking>> GetByCustomerIdAsync(int customerId);
        Task<List<Booking>> GetByWorkerIdAsync(int workerId);
        Task<List<Booking>> GetByServiceIdAsync(int serviceId);
        Task<Booking> CreateAsync(Booking booking);
        Task<bool> UpdateAsync(int id, Booking booking);
        Task<bool> ChangeStatusAsync(int id, BookingStatus newStatus);
        Task<bool> DeleteAsync(int id);
    }
}
