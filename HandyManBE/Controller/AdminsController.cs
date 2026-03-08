using System.Text;
using BussinessObject;
using HandyManBE.Data;
using HandyManBE.DTOs;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HandyManBE.Controller
{
    [ApiController]
    [Route("api/admins")]
    public class AdminsController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IPasswordHasher<object> _passwordHasher;

        public AdminsController(ApplicationDbContext dbContext, IPasswordHasher<object> passwordHasher)
        {
            _dbContext = dbContext;
            _passwordHasher = passwordHasher;
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<AdminDto>> GetById(int id)
        {
            var admin = await _dbContext.Admins
                .AsNoTracking()
                .Where(a => a.AdminId == id)
                .Select(a => new AdminDto
                {
                    AdminId = a.AdminId,
                    FirstName = a.FirstName,
                    LastName = a.LastName,
                    Email = a.Email,
                    IsActive = a.IsActive
                })
                .FirstOrDefaultAsync();

            if (admin == null)
            {
                return NotFound();
            }

            return Ok(admin);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, AdminUpdateDto admin)
        {
            var entity = await _dbContext.Admins.FindAsync(id);
            if (entity == null)
            {
                return NotFound();
            }

            entity.FirstName = admin.FirstName;
            entity.LastName = admin.LastName;
            entity.Email = admin.Email;
            entity.ModifiedAtUtc = DateTime.UtcNow;

            if (!string.IsNullOrWhiteSpace(admin.Password))
            {
                entity.Password = HashPassword(admin.Password);
            }

            try
            {
                await _dbContext.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return Conflict(new { errors = new[] { "Email already exists." } });
            }

            return NoContent();
        }

        private byte[] HashPassword(string password)
        {
            var hashed = _passwordHasher.HashPassword(null, password);
            return Encoding.UTF8.GetBytes(hashed);
        }

        [HttpGet("moderation/users")]
        public async Task<IActionResult> GetModerationUsers()
        {
            var workers = await _dbContext.Workers
                .AsNoTracking()
                .Select(w => new
                {
                    Role = "Worker",
                    Id = w.WorkerId,
                    Name = w.FirstName + " " + w.LastName,
                    w.Email,
                    w.IsBlocked,
                    w.IsApprovedByAdmin,
                    w.RequiresAdminPreApproval,
                    w.IsEmailVerified,
                    w.IsPhoneVerified,
                    IdVerificationStatus = w.IdVerificationStatus.ToString()
                })
                .ToListAsync();

            var customers = await _dbContext.Customers
                .AsNoTracking()
                .Select(c => new
                {
                    Role = "Customer",
                    Id = c.CustomerId,
                    Name = c.FirstName + " " + c.LastName,
                    c.Email,
                    c.IsBlocked,
                    c.IsApprovedByAdmin,
                    c.RequiresAdminPreApproval,
                    c.IsEmailVerified,
                    c.IsPhoneVerified,
                    IdVerificationStatus = c.IdVerificationStatus.ToString()
                })
                .ToListAsync();

            return Ok(new
            {
                workers,
                customers
            });
        }

        [HttpPut("moderation/worker/{workerId:int}")]
        public async Task<IActionResult> UpdateWorkerModeration(int workerId, AdminUserModerationUpdateDto dto)
        {
            var worker = await _dbContext.Workers.FirstOrDefaultAsync(w => w.WorkerId == workerId);
            if (worker == null)
            {
                return NotFound();
            }

            worker.IsBlocked = dto.IsBlocked;
            worker.IsApprovedByAdmin = dto.IsApprovedByAdmin;
            worker.IdVerificationStatus = dto.IdVerificationStatus;
            worker.ModifiedAtUtc = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("moderation/customer/{customerId:int}")]
        public async Task<IActionResult> UpdateCustomerModeration(int customerId, AdminUserModerationUpdateDto dto)
        {
            var customer = await _dbContext.Customers.FirstOrDefaultAsync(c => c.CustomerId == customerId);
            if (customer == null)
            {
                return NotFound();
            }

            customer.IsBlocked = dto.IsBlocked;
            customer.IsApprovedByAdmin = dto.IsApprovedByAdmin;
            customer.IdVerificationStatus = dto.IdVerificationStatus;
            customer.ModifiedAtUtc = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }
    }
}
