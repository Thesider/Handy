using BussinessObject;
using System;
using System.Linq;

namespace HandyManBE.DTOs
{
    public static class DtoMapper
    {
        public static Address ToEntity(AddressDto dto)
        {
            return new Address
            {
                Street = dto.Street,
                City = dto.City,
                State = dto.State,
                PostalCode = dto.PostalCode,
                Country = dto.Country
            };
        }

        public static AddressDto ToDto(Address address)
        {
            return new AddressDto
            {
                Street = address.Street,
                City = address.City,
                State = address.State,
                PostalCode = address.PostalCode,
                Country = address.Country
            };
        }

        public static Worker ToEntity(WorkerCreateUpdateDto dto, int? id = null)
        {
            return new Worker
            {
                WorkerId = id ?? 0,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                YearsOfExperience = dto.YearsOfExperience,
                IsAvailable = dto.IsAvailable,
                HourlyRate = dto.HourlyRate,
                Rating = dto.Rating,
                Address = ToEntity(dto.Address),
                WorkerProfileId = dto.WorkerProfileId,
                Password = Array.Empty<byte>()
            };
        }

        public static WorkerDto ToDto(Worker worker)
        {
            return new WorkerDto
            {
                WorkerId = worker.WorkerId,
                FirstName = worker.FirstName,
                LastName = worker.LastName,
                Email = worker.Email,
                PhoneNumber = worker.PhoneNumber,
                YearsOfExperience = worker.YearsOfExperience,
                IsAvailable = worker.IsAvailable,
                HourlyRate = worker.HourlyRate,
                Rating = worker.Rating,
                Address = worker.Address == null ? new AddressDto() : ToDto(worker.Address),
                WorkerProfileId = worker.WorkerProfileId
            };
        }

        public static Service ToEntity(ServiceCreateUpdateDto dto, int? id = null)
        {
            return new Service
            {
                ServiceId = id ?? 0,
                ServiceName = dto.ServiceName,
                ServiceFee = dto.ServiceFee,
                TotalJobs = dto.TotalJobs
            };
        }

        public static ServiceDto ToDto(Service service)
        {
            return new ServiceDto
            {
                ServiceId = service.ServiceId,
                ServiceName = service.ServiceName,
                ServiceFee = service.ServiceFee,
                TotalJobs = service.TotalJobs
            };
        }

        public static Booking ToEntity(BookingCreateUpdateDto dto, int? id = null)
        {
            return new Booking
            {
                BookingId = id ?? 0,
                CustomerId = dto.CustomerId,
                WorkerId = dto.WorkerId,
                ServiceId = dto.ServiceId,
                MinPrice = dto.MinPrice,
                MaxPrice = dto.MaxPrice,
                StartAt = dto.StartAt,
                EndAt = dto.EndAt,
                Status = dto.Status,
                Amount = dto.Amount,
                Notes = dto.Notes ?? string.Empty
            };
        }

        public static BookingDto ToDto(Booking booking)
        {
            return new BookingDto
            {
                BookingId = booking.BookingId,
                CustomerId = booking.CustomerId,
                WorkerId = booking.WorkerId,
                ServiceId = booking.ServiceId,
                MinPrice = booking.MinPrice,
                MaxPrice = booking.MaxPrice,
                StartAt = booking.StartAt,
                EndAt = booking.EndAt,
                Status = booking.Status,
                Amount = booking.Amount,
                Notes = booking.Notes
            };
        }

        public static Review ToEntity(ReviewCreateDto dto, int? id = null)
        {
            return new Review
            {
                ReviewId = id ?? 0,
                CustomerId = dto.CustomerId,
                WorkerId = dto.WorkerId,
                Rating = dto.Rating,
                Comment = dto.Comment
            };
        }

        public static ReviewDto ToDto(Review review)
        {
            return new ReviewDto
            {
                ReviewId = review.ReviewId,
                Rating = review.Rating,
                Comment = review.Comment,
                CustomerId = review.CustomerId,
                WorkerId = review.WorkerId
            };
        }

        public static JobGig ToEntity(JobGigCreateDto dto)
        {
            return new JobGig
            {
                Title = dto.Title,
                Description = dto.Description,
                Budget = dto.Budget,
                ServiceId = dto.ServiceId,
                CustomerId = dto.CustomerId,
                Location = dto.Location,
                CreatedAtUtc = DateTime.UtcNow,
                Status = Enums.JobGigStatus.Open
            };
        }

        public static JobGigDto ToDto(JobGig gig)
        {
            return new JobGigDto
            {
                JobGigId = gig.JobGigId,
                Title = gig.Title,
                Description = gig.Description,
                Budget = gig.Budget,
                ServiceId = gig.ServiceId,
                ServiceType = gig.Service?.ServiceName ?? "Unknown",
                CustomerId = gig.CustomerId,
                CustomerName = gig.Customer != null ? $"{gig.Customer.FirstName} {gig.Customer.LastName}" : "Unknown",
                Location = gig.Location,
                Status = gig.Status,
                CreatedAtUtc = gig.CreatedAtUtc,
                AcceptedBidId = gig.AcceptedBidId,
                Bids = gig.Bids?.Select(ToDto).ToList() ?? new List<BidDto>()
            };
        }

        public static Bid ToEntity(BidCreateDto dto)
        {
            return new Bid
            {
                JobGigId = dto.JobGigId,
                WorkerId = dto.WorkerId,
                Amount = dto.Amount,
                Message = dto.Message,
                CreatedAtUtc = DateTime.UtcNow
            };
        }

        public static BidDto ToDto(Bid bid)
        {
            return new BidDto
            {
                BidId = bid.BidId,
                JobGigId = bid.JobGigId,
                WorkerId = bid.WorkerId,
                WorkerName = bid.Worker != null ? $"{bid.Worker.FirstName} {bid.Worker.LastName}" : "Unknown",
                Amount = bid.Amount,
                Message = bid.Message,
                CreatedAtUtc = bid.CreatedAtUtc,
                WorkerRating = bid.Worker?.Rating ?? 0
            };
        }
    }
}
