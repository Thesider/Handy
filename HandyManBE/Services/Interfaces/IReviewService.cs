using BussinessObject;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HandyManBE.Services
{
    public interface IReviewService
    {
        Task<List<Review>> GetAllAsync();
        Task<Review?> GetByIdAsync(int id);
        Task<List<Review>> GetByWorkerIdAsync(int workerId);
        Task<List<Review>> GetByCustomerIdAsync(int customerId);
        Task<Review> CreateAsync(Review review);
        Task<bool> DeleteAsync(int id);
    }
}
