using BussinessObject;
using HandyManBE.DAO;
using System.Collections.Generic;
using System.Threading.Tasks;
using Validate;

namespace HandyManBE.Services
{
    public class ServiceAppService : IServiceAppService
    {
        private readonly IServiceDao _dao;

        public ServiceAppService(IServiceDao dao)
        {
            _dao = dao;
        }

        public Task<List<Service>> GetAllAsync() => _dao.GetAllAsync();

        public Task<Service?> GetByIdAsync(int id) => _dao.GetByIdAsync(id);

        public Task<Service> CreateAsync(Service service)
        {
            var errors = ValidationRules.ValidateService(service);
            if (errors.Count > 0) throw new ValidationException(errors);

            return _dao.CreateAsync(service);
        }

        public Task<bool> UpdateAsync(int id, Service service)
        {
            if (id != service.ServiceId)
            {
                throw new ValidationException(new[] { "ServiceId mismatch." });
            }

            var errors = ValidationRules.ValidateService(service);
            if (errors.Count > 0) throw new ValidationException(errors);

            return _dao.UpdateAsync(id, service);
        }

        public Task<bool> DeleteAsync(int id) => _dao.DeleteAsync(id);
    }
}
