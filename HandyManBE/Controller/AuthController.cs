using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BussinessObject;
using HandyManBE.Data;
using HandyManBE.DTOs;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace HandyManBE.Controller
{
    [ApiController]
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IConfiguration _configuration;
        private readonly IPasswordHasher<object> _passwordHasher;

        public AuthController(ApplicationDbContext dbContext, IConfiguration configuration, IPasswordHasher<object> passwordHasher)
        {
            _dbContext = dbContext;
            _configuration = configuration;
            _passwordHasher = passwordHasher;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginRequestDto request)
        {
            var email = request.Email.Trim().ToLowerInvariant();

            var customer = await _dbContext.Customers.FirstOrDefaultAsync(c => c.Email.ToLower() == email);
            if (customer != null && VerifyPassword(customer.Password, request.Password))
            {
                return Ok(BuildResponse(customer.CustomerId, customer.Email, "Customer", $"{customer.FirstName} {customer.LastName}"));
            }

            var worker = await _dbContext.Workers.FirstOrDefaultAsync(w => w.Email.ToLower() == email);
            if (worker != null && VerifyPassword(worker.Password, request.Password))
            {
                return Ok(BuildResponse(worker.WorkerId, worker.Email, "Worker", $"{worker.FirstName} {worker.LastName}"));
            }

            var admin = await _dbContext.Admins.FirstOrDefaultAsync(a => a.Email.ToLower() == email && a.IsActive);
            if (admin != null && VerifyPassword(admin.Password, request.Password))
            {
                return Ok(BuildResponse(admin.AdminId, admin.Email, "Admin", $"{admin.FirstName} {admin.LastName}"));
            }

            return Unauthorized(new { message = "Invalid credentials." });
        }

        [HttpPost("register/customer")]
        public async Task<ActionResult<AuthResponseDto>> RegisterCustomer(RegisterCustomerRequestDto request)
        {
            if (await EmailExists(request.Email))
            {
                return Conflict(new { message = "Email already exists." });
            }

            var customer = new Customer
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                Password = HashPassword(request.Password)
            };

            _dbContext.Customers.Add(customer);
            await _dbContext.SaveChangesAsync();

            return Ok(BuildResponse(customer.CustomerId, customer.Email, "Customer", $"{customer.FirstName} {customer.LastName}"));
        }

        [HttpPost("register/worker")]
        public async Task<ActionResult<AuthResponseDto>> RegisterWorker(RegisterWorkerRequestDto request)
        {
            if (await EmailExists(request.Email))
            {
                return Conflict(new { message = "Email already exists." });
            }

            var worker = new Worker
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                YearsOfExperience = request.YearsOfExperience,
                HourlyRate = request.HourlyRate,
                IsAvailable = false,
                Rating = 0,
                Address = new Address
                {
                    Street = request.Address.Street,
                    City = request.Address.City,
                    State = request.Address.State ?? string.Empty,
                    PostalCode = request.Address.PostalCode,
                    Country = request.Address.Country ?? string.Empty
                },
                Password = HashPassword(request.Password)
            };

            _dbContext.Workers.Add(worker);
            await _dbContext.SaveChangesAsync();

            return Ok(BuildResponse(worker.WorkerId, worker.Email, "Worker", $"{worker.FirstName} {worker.LastName}"));
        }

        private async Task<bool> EmailExists(string email)
        {
            var normalized = email.Trim().ToLowerInvariant();
            return await _dbContext.Customers.AnyAsync(c => c.Email.ToLower() == normalized)
                || await _dbContext.Workers.AnyAsync(w => w.Email.ToLower() == normalized)
                || await _dbContext.Admins.AnyAsync(a => a.Email.ToLower() == normalized);
        }

        private AuthResponseDto BuildResponse(int id, string email, string role, string name)
        {
            return new AuthResponseDto
            {
                Token = CreateToken(id, email, role, name),
                User = new AuthUserDto
                {
                    Id = id,
                    Email = email,
                    Role = role,
                    Name = name
                }
            };
        }

        private string CreateToken(int id, string email, string role, string name)
        {
            var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is missing.");
            var issuer = _configuration["Jwt:Issuer"] ?? "handyman";
            var audience = _configuration["Jwt:Audience"] ?? "handyman";

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim(ClaimTypes.Role, role),
                new Claim("name", name)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(4),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private byte[] HashPassword(string password)
        {
            var hashed = _passwordHasher.HashPassword(null, password);
            return Encoding.UTF8.GetBytes(hashed);
        }

        private bool VerifyPassword(byte[] hashedBytes, string password)
        {
            var hashed = Encoding.UTF8.GetString(hashedBytes);
            var result = _passwordHasher.VerifyHashedPassword(null, hashed, password);
            return result == PasswordVerificationResult.Success;
        }
    }
}
