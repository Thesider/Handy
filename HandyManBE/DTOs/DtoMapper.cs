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
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                IsAvailable = dto.IsAvailable,
                HourlyRate = dto.HourlyRate,
                Rating = dto.Rating,
                Address = ToEntity(dto.Address),
                WorkerProfileId = dto.WorkerProfileId,
                ProfileImageUrl = dto.ProfileImageUrl,
                Bio = dto.Bio,
                SkillsCsv = dto.SkillsCsv,
                IsEmailVerified = dto.IsEmailVerified,
                IsPhoneVerified = dto.IsPhoneVerified,
                IdVerificationStatus = dto.IdVerificationStatus,
                RequiresAdminPreApproval = dto.RequiresAdminPreApproval,
                IsApprovedByAdmin = dto.IsApprovedByAdmin,
                IsBlocked = dto.IsBlocked,
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
                Latitude = worker.Latitude,
                Longitude = worker.Longitude,
                IsAvailable = worker.IsAvailable,
                HourlyRate = worker.HourlyRate,
                Rating = worker.Rating,
                Address = worker.Address == null ? new AddressDto() : ToDto(worker.Address),
                WorkerProfileId = worker.WorkerProfileId,
                ProfileImageUrl = worker.ProfileImageUrl,
                Bio = worker.Bio,
                SkillsCsv = worker.SkillsCsv,
                IsEmailVerified = worker.IsEmailVerified,
                IsPhoneVerified = worker.IsPhoneVerified,
                IdVerificationStatus = worker.IdVerificationStatus,
                RequiresAdminPreApproval = worker.RequiresAdminPreApproval,
                IsApprovedByAdmin = worker.IsApprovedByAdmin,
                IsBlocked = worker.IsBlocked
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
                Price = dto.Price,
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
                Price = booking.Price,
                StartAt = booking.StartAt,
                EndAt = booking.EndAt,
                Status = booking.Status,
                Amount = booking.Amount,
                Notes = booking.Notes,
                PaymentStatus = booking.PaymentStatus,
                PaymentCapturedAt = booking.PaymentCapturedAt,
                PaymentReference = booking.PaymentReference
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
                Comment = dto.Comment,
                BookingId = dto.BookingId
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
                WorkerId = review.WorkerId,
                BookingId = review.BookingId
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
                Address = ToEntity(dto.Address),
                IsRemote = dto.IsRemote,
                PreferredStartAt = dto.PreferredStartAt,
                PreferredEndAt = dto.PreferredEndAt,
                Price = dto.Price,
                IsMicroJob = dto.IsMicroJob,
                MicroJobTemplate = dto.MicroJobTemplate,
                EstimatedHours = dto.EstimatedHours,
                CreatedAtUtc = DateTime.UtcNow,
                Status = Enums.JobGigStatus.Open,
                NumWorkersRequired = dto.NumWorkersRequired,
                DurationDays = dto.DurationDays
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
                Address = gig.Address != null ? ToDto(gig.Address) : new AddressDto(),
                IsRemote = gig.IsRemote,
                PreferredStartAt = gig.PreferredStartAt,
                PreferredEndAt = gig.PreferredEndAt,
                Price = gig.Price,
                IsMicroJob = gig.IsMicroJob,
                MicroJobTemplate = gig.MicroJobTemplate,
                EstimatedHours = gig.EstimatedHours,
                Status = gig.Status,
                CreatedAtUtc = gig.CreatedAtUtc,
                NumWorkersRequired = gig.NumWorkersRequired,
                DurationDays = gig.DurationDays,
                // AcceptedBidId = gig.AcceptedBidId,
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
                ResponseType = dto.ResponseType,
                EstimatedArrivalMinutes = dto.EstimatedArrivalMinutes,
                EstimatedDurationHours = dto.EstimatedDurationHours,
                CreatedAtUtc = DateTime.UtcNow,
                IsAccepted = false
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
                ResponseType = bid.ResponseType,
                EstimatedArrivalMinutes = bid.EstimatedArrivalMinutes,
                EstimatedDurationHours = bid.EstimatedDurationHours,
                CreatedAtUtc = bid.CreatedAtUtc,
                WorkerRating = bid.Worker?.Rating ?? 0,
                IsAccepted = bid.IsAccepted
            };
        }
    }
}
