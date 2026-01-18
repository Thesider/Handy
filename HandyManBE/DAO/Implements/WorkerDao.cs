using BussinessObject;
using HandyManBE.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HandyManBE.DAO
{
    public class WorkerDao : IWorkerDao
    {
        private readonly ApplicationDbContext _db;

        public WorkerDao(ApplicationDbContext db)
        {
            _db = db;
        }

        public Task<List<Worker>> GetAllAsync()
        {
            return _db.Workers
                .Include(w => w.WorkerProfile)
                .Include(w => w.WorkerServices)
                    .ThenInclude(ws => ws.Service)
                .AsNoTracking()
                .ToListAsync();
        }

        public Task<Worker?> GetByIdAsync(int id)
        {
            return _db.Workers
                .Include(w => w.WorkerProfile)
                .Include(w => w.WorkerServices)
                    .ThenInclude(ws => ws.Service)
                .AsNoTracking()
                .FirstOrDefaultAsync(w => w.WorkerId == id);
        }

        public async Task<Worker> CreateAsync(Worker worker)
        {
            _db.Workers.Add(worker);
            await _db.SaveChangesAsync();
            return worker;
        }

        public async Task<bool> UpdateAsync(int id, Worker worker)
        {
            var existing = await _db.Workers.FirstOrDefaultAsync(w => w.WorkerId == id);
            if (existing == null)
            {
                return false;
            }

            _db.Entry(existing).CurrentValues.SetValues(worker);
            existing.ModifiedAtUtc = System.DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _db.Workers.FirstOrDefaultAsync(w => w.WorkerId == id);
            if (existing == null)
            {
                return false;
            }

            _db.Workers.Remove(existing);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
