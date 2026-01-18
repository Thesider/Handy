using BussinessObject;
using HandyManBE.Data;
using HandyManBE.DTOs;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace HandyManBE.Controller
{
    [ApiController]
    [Route("api/customers")]
    public class CustomersController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IPasswordHasher<object> _passwordHasher;

        public CustomersController(ApplicationDbContext dbContext, IPasswordHasher<object> passwordHasher)
        {
            _dbContext = dbContext;
            _passwordHasher = passwordHasher;
        }

        [HttpGet]
        public async Task<ActionResult<List<CustomerDto>>> GetAll()
        {
            var customers = await _dbContext.Customers
                .AsNoTracking()
                .Select(c => new CustomerDto
                {
                    CustomerId = c.CustomerId,
                    FirstName = c.FirstName,
                    LastName = c.LastName,
                    Email = c.Email,
                    PhoneNumber = c.PhoneNumber
                })
                .ToListAsync();

            return Ok(customers);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<CustomerDto>> GetById(int id)
        {
            var customer = await _dbContext.Customers
                .AsNoTracking()
                .Where(c => c.CustomerId == id)
                .Select(c => new CustomerDto
                {
                    CustomerId = c.CustomerId,
                    FirstName = c.FirstName,
                    LastName = c.LastName,
                    Email = c.Email,
                    PhoneNumber = c.PhoneNumber
                })
                .FirstOrDefaultAsync();

            if (customer == null)
            {
                return NotFound();
            }

            return Ok(customer);
        }

        [HttpPost]
        public async Task<ActionResult<CustomerDto>> Create(CustomerCreateUpdateDto customer)
        {
            if (string.IsNullOrWhiteSpace(customer.Password))
            {
                return BadRequest(new { errors = new[] { "Password is required." } });
            }

            var entity = new Customer
            {
                FirstName = customer.FirstName,
                LastName = customer.LastName,
                Email = customer.Email,
                PhoneNumber = customer.PhoneNumber,
                Password = HashPassword(customer.Password)
            };

            _dbContext.Customers.Add(entity);

            try
            {
                await _dbContext.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return Conflict(new { errors = new[] { "Email already exists." } });
            }

            return CreatedAtAction(nameof(GetById), new { id = entity.CustomerId }, new CustomerDto
            {
                CustomerId = entity.CustomerId,
                FirstName = entity.FirstName,
                LastName = entity.LastName,
                Email = entity.Email,
                PhoneNumber = entity.PhoneNumber
            });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, CustomerCreateUpdateDto customer)
        {
            var entity = await _dbContext.Customers.FindAsync(id);
            if (entity == null)
            {
                return NotFound();
            }

            entity.FirstName = customer.FirstName;
            entity.LastName = customer.LastName;
            entity.Email = customer.Email;
            entity.PhoneNumber = customer.PhoneNumber;

            if (!string.IsNullOrWhiteSpace(customer.Password))
            {
                entity.Password = HashPassword(customer.Password);
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

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _dbContext.Customers.FindAsync(id);
            if (entity == null)
            {
                return NotFound();
            }

            _dbContext.Customers.Remove(entity);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }

        private byte[] HashPassword(string password)
        {
            var hashed = _passwordHasher.HashPassword(null, password);
            return Encoding.UTF8.GetBytes(hashed);
        }
    }
}
