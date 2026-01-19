using System.Text;
using BussinessObject;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HandyManBE.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Worker> Workers { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<WorkerService> WorkerServices { get; set; }
        public DbSet<WorkerProfile> WorkerProfiles { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Admin> Admins { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Worker>(entity =>
            {
                entity.HasKey(w => w.WorkerId);
                entity.Property(w => w.HourlyRate).HasColumnType("decimal(18,2)");
                entity.Property(w => w.Rating).HasColumnType("decimal(3,2)");
                entity.HasIndex(w => w.Email).IsUnique();

                entity.OwnsOne(w => w.Address);

                entity.HasMany(w => w.WorkerServices)
                    .WithOne(ws => ws.Worker)
                    .HasForeignKey(ws => ws.WorkerId);

                entity.HasOne(w => w.WorkerProfile)
                    .WithOne(wp => wp.Worker)
                    .HasForeignKey<WorkerProfile>(wp => wp.WorkerId);
            });

            modelBuilder.Entity<Service>(entity =>
            {
                entity.HasKey(s => s.ServiceId);
                entity.Property(s => s.ServiceFee).HasColumnType("decimal(18,2)");
                entity.Property(s => s.MinPrice).HasColumnType("decimal(18,2)");
                entity.Property(s => s.MaxPrice).HasColumnType("decimal(18,2)");

                entity.HasMany(s => s.WorkerServices)
                    .WithOne(ws => ws.Service)
                    .HasForeignKey(ws => ws.ServiceId);
            });

            modelBuilder.Entity<WorkerService>(entity =>
            {
                entity.HasKey(ws => ws.WorkerServiceId);
                entity.Property(ws => ws.CustomHourlyRate).HasColumnType("decimal(18,2)");
                entity.Property(ws => ws.ServiceFee).HasColumnType("decimal(18,2)");
            });

            modelBuilder.Entity<WorkerProfile>(entity =>
            {
                entity.HasKey(wp => wp.WorkerProfileId);
            });

            modelBuilder.Entity<Customer>(entity =>
            {
                entity.HasKey(c => c.CustomerId);
                entity.HasIndex(c => c.Email).IsUnique();
                entity.Property(c => c.RowVersion).IsRowVersion();
            });

            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasKey(r => r.ReviewId);
            });

            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasKey(b => b.BookingId);
                entity.Property(b => b.Amount).HasColumnType("decimal(18,2)");
                entity.Property(b => b.MinPrice).HasColumnType("decimal(18,2)");
                entity.Property(b => b.MaxPrice).HasColumnType("decimal(18,2)");
                entity.Property(b => b.RowVersion).IsRowVersion();
            });

            modelBuilder.Entity<Admin>(entity =>
            {
                entity.HasKey(a => a.AdminId);
                entity.HasIndex(a => a.Email).IsUnique();
                entity.Property(a => a.RowVersion).IsRowVersion();
            });

            // Seed data
            modelBuilder.Entity<Service>().HasData(
                new Service
                {
                    ServiceId = 1,
                    ServiceName = "Plumbing",
                    ServiceFee = 25m,
                    MinPrice = 15m,
                    MaxPrice = 50m,
                    TotalJobs = 120
                },
                new Service
                {
                    ServiceId = 2,
                    ServiceName = "Electrical",
                    ServiceFee = 30m,
                    MinPrice = 20m,
                    MaxPrice = 75m,
                    TotalJobs = 85
                }
            );

            modelBuilder.Entity<Worker>().HasData(
                new Worker
                {
                    WorkerId = 1,
                    FirstName = "John",
                    LastName = "Doe",
                    Email = "john.doe@handyman.local",
                    PhoneNumber = "+1-555-0101",
                    IsAvailable = true,
                    HourlyRate = 20m,
                    Rating = 4.5m,
                    Password = new byte[] { 1, 2, 3 },
                    CreatedAtUtc = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new Worker
                {
                    WorkerId = 2,
                    FirstName = "Jane",
                    LastName = "Smith",
                    Email = "jane.smith@handyman.local",
                    PhoneNumber = "+1-555-0102",
                    IsAvailable = false,
                    HourlyRate = 28m,
                    Rating = 4.8m,
                    Password = new byte[] { 4, 5, 6 },
                    CreatedAtUtc = new DateTime(2025, 1, 2, 0, 0, 0, DateTimeKind.Utc)
                }
            );

            modelBuilder.Entity<Worker>().OwnsOne(w => w.Address).HasData(
                new
                {
                    WorkerId = 1,
                    Street = "123 Main St",
                    City = "Springfield",
                    State = "IL",
                    PostalCode = "62701",
                    Country = "USA"
                },
                new
                {
                    WorkerId = 2,
                    Street = "456 Oak Ave",
                    City = "Madison",
                    State = "WI",
                    PostalCode = "53703",
                    Country = "USA"
                }
            );

            modelBuilder.Entity<WorkerService>().HasData(
                new WorkerService
                {
                    WorkerServiceId = 1,
                    WorkerId = 1,
                    ServiceId = 1,
                    ServiceFee = 25m
                },
                new WorkerService
                {
                    WorkerServiceId = 2,
                    WorkerId = 2,
                    ServiceId = 2,
                    ServiceFee = 30m
                }
            );

            modelBuilder.Entity<Admin>().HasData(
                new Admin
                {
                    AdminId = 1,
                    FirstName = "System",
                    LastName = "Administrator",
                    Email = "admin@handyman.local",
                    Password = Encoding.UTF8.GetBytes("Admin@123"),
                    IsActive = true,
                    CreatedAtUtc = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                }
            );
        }


    }
}
