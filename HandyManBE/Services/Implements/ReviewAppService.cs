using BussinessObject;
using HandyManBE.DAO;
using System.Collections.Generic;
using System.Threading.Tasks;
using Validate;
namespace HandyManBE.Services
{
    public class ReviewAppService : IReviewService
    {
        private readonly IReviewDao _dao;

        public ReviewAppService(IReviewDao dao)
        {
            _dao = dao;
        }

        public Task<List<Review>> GetAllAsync() => _dao.GetAllAsync();

        public Task<Review?> GetByIdAsync(int id) => _dao.GetByIdAsync(id);

        public Task<List<Review>> GetByWorkerIdAsync(int workerId) => _dao.GetByWorkerIdAsync(workerId);

        public Task<List<Review>> GetByCustomerIdAsync(int customerId) => _dao.GetByCustomerIdAsync(customerId);

        public Task<Review> CreateAsync(Review review)
        {
            var errors = ValidationRules.ValidateReview(review);
            if (errors.Count > 0) throw new ValidationException(errors);

            return _dao.CreateAsync(review);
        }

        public Task<bool> DeleteAsync(int id) => _dao.DeleteAsync(id);
    }
}
