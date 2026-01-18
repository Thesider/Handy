using BussinessObject;
using HandyManBE.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HandyManBE.DAO
{
    public class ServiceDao : IServiceDao
    {
        private readonly ApplicationDbContext _db;

        public ServiceDao(ApplicationDbContext db)
        {
            _db = db;
        }

        public Task<List<Service>> GetAllAsync()
        {
            return _db.Services
                .Include(s => s.WorkerServices)
                    .ThenInclude(ws => ws.Worker)
                .AsNoTracking()
                .ToListAsync();
        }

        public Task<Service?> GetByIdAsync(int id)
        {
            return _db.Services
                .Include(s => s.WorkerServices)
                    .ThenInclude(ws => ws.Worker)
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.ServiceId == id);
        }

        public async Task<Service> CreateAsync(Service service)
        {
            _db.Services.Add(service);
            await _db.SaveChangesAsync();
            return service;
        }

        public async Task<bool> UpdateAsync(int id, Service service)
        {
            var existing = await _db.Services.FirstOrDefaultAsync(s => s.ServiceId == id);
            if (existing == null)
            {
                return false;
            }

            _db.Entry(existing).CurrentValues.SetValues(service);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _db.Services.FirstOrDefaultAsync(s => s.ServiceId == id);
            if (existing == null)
            {
                return false;
            }

            _db.Services.Remove(existing);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
