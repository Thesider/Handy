using BussinessObject;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HandyManBE.Services
{
    public interface IWorkerService
    {
        Task<List<Worker>> GetAllAsync();
        Task<Worker?> GetByIdAsync(int id);
        Task<Worker> CreateAsync(Worker worker);
        Task<bool> UpdateAsync(int id, Worker worker);
        Task<bool> DeleteAsync(int id);
    }
}
