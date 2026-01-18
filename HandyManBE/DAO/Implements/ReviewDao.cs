using BussinessObject;
using HandyManBE.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HandyManBE.DAO
{
    public class ReviewDao : IReviewDao
    {
        private readonly ApplicationDbContext _db;

        public ReviewDao(ApplicationDbContext db)
        {
            _db = db;
        }

        public Task<List<Review>> GetAllAsync()
        {
            return _db.Reviews
                .Include(r => r.Worker)
                .Include(r => r.Customer)
                .AsNoTracking()
                .ToListAsync();
        }

        public Task<Review?> GetByIdAsync(int id)
        {
            return _db.Reviews
                .Include(r => r.Worker)
                .Include(r => r.Customer)
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.ReviewId == id);
        }

        public Task<List<Review>> GetByWorkerIdAsync(int workerId)
        {
            return _db.Reviews
                .Include(r => r.Worker)
                .Include(r => r.Customer)
                .AsNoTracking()
                .Where(r => r.WorkerId == workerId)
                .ToListAsync();
        }

        public Task<List<Review>> GetByCustomerIdAsync(int customerId)
        {
            return _db.Reviews
                .Include(r => r.Worker)
                .Include(r => r.Customer)
                .AsNoTracking()
                .Where(r => r.CustomerId == customerId)
                .ToListAsync();
        }

        public async Task<Review> CreateAsync(Review review)
        {
            _db.Reviews.Add(review);
            await _db.SaveChangesAsync();
            return review;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _db.Reviews.FirstOrDefaultAsync(r => r.ReviewId == id);
            if (existing == null)
            {
                return false;
            }

            _db.Reviews.Remove(existing);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
