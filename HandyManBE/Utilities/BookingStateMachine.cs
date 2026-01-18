using System;
using System.Collections.Generic;
using Enums;

namespace Ulilities
{
    public static class BookingStateMachine
    {
        private static readonly IReadOnlyDictionary<BookingStatus, HashSet<BookingStatus>> AllowedTransitions
            = new Dictionary<BookingStatus, HashSet<BookingStatus>>
            {
                { BookingStatus.Pending, new HashSet<BookingStatus> { BookingStatus.Confirmed, BookingStatus.Declined, BookingStatus.Cancelled } },
                { BookingStatus.Confirmed, new HashSet<BookingStatus> { BookingStatus.InProgress, BookingStatus.Cancelled } },
                { BookingStatus.InProgress, new HashSet<BookingStatus> { BookingStatus.Completed, BookingStatus.Cancelled } },
                { BookingStatus.Completed, new HashSet<BookingStatus>() },
                { BookingStatus.Cancelled, new HashSet<BookingStatus>() },
                { BookingStatus.Declined, new HashSet<BookingStatus>() }
            };

        public static bool CanTransition(BookingStatus from, BookingStatus to)
        {
            if (from == to)
            {
                return true;
            }

            return AllowedTransitions.TryGetValue(from, out var allowed) && allowed.Contains(to);
        }

        public static void EnsureTransition(BookingStatus from, BookingStatus to)
        {
            if (!CanTransition(from, to))
            {
                throw new InvalidOperationException($"Invalid booking status transition: {from} -> {to}.");
            }
        }

        public static BookingStatus Transition(BookingStatus from, BookingStatus to)
        {
            EnsureTransition(from, to);
            return to;
        }
    }
}
