using BussinessObject;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HandyManBE.DAO
{
    public interface IServiceDao
    {
        Task<List<Service>> GetAllAsync();
        Task<Service?> GetByIdAsync(int id);
        Task<Service> CreateAsync(Service service);
        Task<bool> UpdateAsync(int id, Service service);
        Task<bool> DeleteAsync(int id);
    }
}
