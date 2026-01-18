using System.Text;
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
    }
}
