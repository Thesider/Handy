using System.Collections.Generic;
using System.Threading.Tasks;
using BussinessObject;
using Enums;

namespace HandyManBE.Services
{
    public interface IJobGigService
    {
        Task<List<JobGig>> GetAllAsync();
        Task<JobGig> GetByIdAsync(int id);
        Task<List<JobGig>> GetByCustomerIdAsync(int customerId);
        Task<JobGig> CreateAsync(JobGig gig);
        Task<bool> AcceptBidAsync(int jobGigId, int bidId);
        Task<Bid> AddBidAsync(Bid bid);
        Task<bool> ChangeStatusAsync(int id, JobGigStatus status);
    }
}
