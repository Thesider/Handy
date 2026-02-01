using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BussinessObject;
using Enums;
using HandyManBE.Data;
using Microsoft.EntityFrameworkCore;

namespace HandyManBE.Services
{
    public class JobGigService : IJobGigService
    {
        private readonly ApplicationDbContext _context;

        public JobGigService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<JobGig>> GetAllAsync()
        {
            return await _context.JobGigs
                .Include(jg => jg.Customer)
                .Include(jg => jg.Service)
                .Include(jg => jg.Bids)
                    .ThenInclude(b => b.Worker)
                .OrderByDescending(jg => jg.CreatedAtUtc)
                .ToListAsync();
        }

        public async Task<JobGig> GetByIdAsync(int id)
        {
            return await _context.JobGigs
                .Include(jg => jg.Customer)
                .Include(jg => jg.Service)
                .Include(jg => jg.Bids)
                    .ThenInclude(b => b.Worker)
                .FirstOrDefaultAsync(jg => jg.JobGigId == id);
        }

        public async Task<List<JobGig>> GetByCustomerIdAsync(int customerId)
        {
            return await _context.JobGigs
                .Include(jg => jg.Customer)
                .Include(jg => jg.Service)
                .Include(jg => jg.Bids)
                    .ThenInclude(b => b.Worker)
                .Where(jg => jg.CustomerId == customerId)
                .OrderByDescending(jg => jg.CreatedAtUtc)
                .ToListAsync();
        }

        public async Task<JobGig> CreateAsync(JobGig gig)
        {
            _context.JobGigs.Add(gig);
            await _context.SaveChangesAsync();
            return gig;
        }

        public async Task<bool> AcceptBidAsync(int jobGigId, int bidId)
        {
            var gig = await _context.JobGigs
                .Include(g => g.Bids)
                .FirstOrDefaultAsync(g => g.JobGigId == jobGigId);

            if (gig == null) return false;

            var bid = gig.Bids.FirstOrDefault(b => b.BidId == bidId);
            if (bid == null) return false;

            // Check if already accepted
            if (bid.IsAccepted) return true;

            // Check if quota is full
            int acceptedCount = gig.Bids.Count(b => b.IsAccepted);
            if (acceptedCount >= gig.NumWorkersRequired)
            {
                // Quota full
                return false;
            }

            bid.IsAccepted = true;
            
            // Should we update status if full?
            if (acceptedCount + 1 >= gig.NumWorkersRequired)
            {
                gig.Status = JobGigStatus.InProgress;
            }
            
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Bid> AddBidAsync(Bid bid)
        {
            _context.Bids.Add(bid);
            await _context.SaveChangesAsync();
            return await _context.Bids
                .Include(b => b.Worker)
                .FirstOrDefaultAsync(b => b.BidId == bid.BidId);
        }

        public async Task<bool> ChangeStatusAsync(int id, JobGigStatus status)
        {
            var gig = await _context.JobGigs.FindAsync(id);
            if (gig == null) return false;

            gig.Status = status;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
