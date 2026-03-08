using Microsoft.AspNetCore.SignalR;

namespace HandyManBE.Hubs
{
    public class MarketplaceHub : Hub
    {
        public Task JoinUser(int userId)
        {
            return Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
        }

        public Task LeaveUser(int userId)
        {
            return Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-{userId}");
        }

        public Task JoinBooking(int bookingId)
        {
            return Groups.AddToGroupAsync(Context.ConnectionId, $"booking-{bookingId}");
        }

        public Task LeaveBooking(int bookingId)
        {
            return Groups.RemoveFromGroupAsync(Context.ConnectionId, $"booking-{bookingId}");
        }
    }
}
