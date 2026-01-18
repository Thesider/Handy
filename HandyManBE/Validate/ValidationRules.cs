using BussinessObject;
using Enums;
using System;
using System.Collections.Generic;

namespace Validate
{
    public static class ValidationRules
    {
        public static List<string> ValidateWorker(Worker worker)
        {
            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(worker.FirstName)) errors.Add("FirstName is required.");
            if (string.IsNullOrWhiteSpace(worker.LastName)) errors.Add("LastName is required.");
            if (string.IsNullOrWhiteSpace(worker.Email)) errors.Add("Email is required.");
            if (string.IsNullOrWhiteSpace(worker.PhoneNumber)) errors.Add("PhoneNumber is required.");
            if (worker.HourlyRate < 0) errors.Add("HourlyRate must be >= 0.");
            if (worker.Rating < 0 || worker.Rating > 5) errors.Add("Rating must be between 0 and 5.");
            if (worker.YearsOfExperience < 0) errors.Add("YearsOfExperience must be >= 0.");
            if (worker.Address == null) errors.Add("Address is required.");
            else
            {
                if (string.IsNullOrWhiteSpace(worker.Address.Street)) errors.Add("Address.Street is required.");
                if (string.IsNullOrWhiteSpace(worker.Address.City)) errors.Add("Address.City is required.");
                if (string.IsNullOrWhiteSpace(worker.Address.PostalCode)) errors.Add("Address.PostalCode is required.");
            }

            return errors;
        }

        public static List<string> ValidateService(Service service)
        {
            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(service.ServiceName)) errors.Add("ServiceName is required.");
            if (service.ServiceFee < 0) errors.Add("ServiceFee must be >= 0.");
            if (service.TotalJobs < 0) errors.Add("TotalJobs must be >= 0.");

            return errors;
        }

        public static List<string> ValidateBooking(Booking booking)
        {
            var errors = new List<string>();

            if (booking.CustomerId <= 0) errors.Add("CustomerId must be > 0.");
            if (booking.WorkerId <= 0) errors.Add("WorkerId must be > 0.");
            if (booking.ServiceId <= 0) errors.Add("ServiceId must be > 0.");
            if (booking.MinPrice < 0) errors.Add("MinPrice must be >= 0.");
            if (booking.MaxPrice < 0) errors.Add("MaxPrice must be >= 0.");
            if (booking.MaxPrice > 0 && booking.MinPrice > booking.MaxPrice)
                errors.Add("MinPrice must be <= MaxPrice.");
            if (booking.Amount < 0) errors.Add("Amount must be >= 0.");
            if (booking.StartAt == default) errors.Add("StartAt is required.");
            if (booking.EndAt.HasValue && booking.EndAt.Value < booking.StartAt) errors.Add("EndAt must be after StartAt.");

            if (!Enum.IsDefined(typeof(BookingStatus), booking.Status))
            {
                errors.Add("Status is invalid.");
            }

            return errors;
        }

        public static List<string> ValidateReview(Review review)
        {
            var errors = new List<string>();

            if (review.CustomerId <= 0) errors.Add("CustomerId must be > 0.");
            if (review.WorkerId <= 0) errors.Add("WorkerId must be > 0.");
            if (review.Rating < 1 || review.Rating > 5) errors.Add("Rating must be between 1 and 5.");
            if (string.IsNullOrWhiteSpace(review.Comment)) errors.Add("Comment is required.");

            return errors;
        }
    }
}
