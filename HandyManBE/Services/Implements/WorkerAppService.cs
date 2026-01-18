using BussinessObject;
using HandyManBE.DAO;
using System.Collections.Generic;
using System.Threading.Tasks;
using Validate;

namespace HandyManBE.Services
{
    public class WorkerAppService : IWorkerService
    {
        private readonly IWorkerDao _dao;

        public WorkerAppService(IWorkerDao dao)
        {
            _dao = dao;
        }

        public Task<List<Worker>> GetAllAsync() => _dao.GetAllAsync();

        public Task<Worker?> GetByIdAsync(int id) => _dao.GetByIdAsync(id);

        public Task<Worker> CreateAsync(Worker worker)
        {
            var errors = ValidationRules.ValidateWorker(worker);
            if (errors.Count > 0) throw new ValidationException(errors);

            return _dao.CreateAsync(worker);
        }

        public Task<bool> UpdateAsync(int id, Worker worker)
        {
            if (id != worker.WorkerId)
            {
                throw new ValidationException(new[] { "WorkerId mismatch." });
            }

            var errors = ValidationRules.ValidateWorker(worker);
            if (errors.Count > 0) throw new ValidationException(errors);

            return _dao.UpdateAsync(id, worker);
        }

        public Task<bool> DeleteAsync(int id) => _dao.DeleteAsync(id);
    }
}
