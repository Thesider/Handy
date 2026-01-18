using BussinessObject;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HandyManBE.DAO
{
    public interface IReviewDao
    {
        Task<List<Review>> GetAllAsync();
        Task<Review?> GetByIdAsync(int id);
        Task<List<Review>> GetByWorkerIdAsync(int workerId);
        Task<List<Review>> GetByCustomerIdAsync(int customerId);
        Task<Review> CreateAsync(Review review);
        Task<bool> DeleteAsync(int id);
    }
}
