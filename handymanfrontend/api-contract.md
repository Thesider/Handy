# Frontend API Contract

Last verified: 2026-03-08
Backend base URL: `http://localhost:5164`
SignalR hub: `/hubs/marketplace`

## Booking Status Labels

Backend enum values:

- `Pending`
- `WorkerAccepted`
- `CustomerConfirmed`
- `InProgress`
- `Completed`
- `Cancelled`
- `Declined`

Frontend display labels:

- `Pending` -> `Pending`
- `WorkerAccepted` -> `Accepted by Worker`
- `CustomerConfirmed` -> `Confirmed by Customer`
- `InProgress` -> `In Progress`
- `Completed` -> `Completed`
- `Cancelled` -> `Cancelled`
- `Declined` -> `Declined`

## REST Contracts

### GET `/api/workers/search`

Query params:

- `latitude?: number`
- `longitude?: number`
- `maxDistanceKm?: number`
- `minRating?: number`
- `minPrice?: number`
- `maxPrice?: number`

Sample request:

```http
GET /api/workers/search?latitude=10.77689&longitude=106.70081&maxDistanceKm=15&minRating=4&minPrice=100000&maxPrice=500000
```

Sample response:

```json
[
  {
    "workerId": 14,
    "isAvailable": true,
    "hourlyRate": 180000,
    "rating": 4.8,
    "firstName": "An",
    "lastName": "Nguyen",
    "email": "an.worker@example.com",
    "phoneNumber": "0901111222",
    "address": {
      "street": "1 Le Loi",
      "city": "Ho Chi Minh City",
      "state": "HCM",
      "country": "VN",
      "postalCode": "700000"
    },
    "distanceKm": 2.34
  }
]
```

### GET `/api/workers/{workerId}/metrics`

Sample request:

```http
GET /api/workers/14/metrics
```

Sample response:

```json
{
  "workerId": 14,
  "totalResponses": 24,
  "acceptedResponses": 18,
  "responseAcceptanceRatePercent": 75.0,
  "assignedBookings": 20,
  "acceptedBookings": 16,
  "bookingAcceptanceRatePercent": 80.0,
  "averageResponseTimeMinutes": 42.7,
  "medianResponseTimeMinutes": 30.0
}
```

### Booking lifecycle endpoints

### PUT `/api/bookings/{id}/worker-accept`

Request body:

```json
{}
```

Response: `204 No Content`

### PUT `/api/bookings/{id}/customer-confirm`

Request body:

```json
{}
```

Response: `204 No Content`

### PUT `/api/bookings/{id}/start`

Request body:

```json
{}
```

Response: `204 No Content`

### PUT `/api/bookings/{id}/complete`

Request body:

```json
{}
```

Response: `204 No Content`

### PUT `/api/bookings/{id}/capture-payment`

Sample request:

```json
{
  "paymentReference": "BOOK-1024",
  "finalAmount": 250000
}
```

Response: `204 No Content`

### PUT `/api/bookings/{id}/status`

Sample request:

```json
"Cancelled"
```

Response: `204 No Content`

### GET `/api/messages/booking/{bookingId}`

Sample response:

```json
[
  {
    "bookingMessageId": 777,
    "bookingId": 1024,
    "senderRole": "Customer",
    "senderId": 11,
    "text": "Can we start at 9 AM?",
    "sentAt": "2026-03-08T08:03:14.1408443+00:00"
  }
]
```

### POST `/api/messages`

Sample request:

```json
{
  "bookingId": 1024,
  "senderRole": "Worker",
  "senderId": 14,
  "text": "Yes, 9 AM works."
}
```

Sample response:

```json
{
  "bookingMessageId": 778,
  "bookingId": 1024,
  "senderRole": "Worker",
  "senderId": 14,
  "text": "Yes, 9 AM works.",
  "sentAt": "2026-03-08T08:05:09.9022311+00:00"
}
```

## SignalR Contracts

Client joins/leaves groups through hub methods:

- `JoinUser(userId)` -> group `user-{id}`
- `LeaveUser(userId)`
- `JoinBooking(bookingId)` -> group `booking-{id}`
- `LeaveBooking(bookingId)`

### Event: `BookingEvent`

Sample payload:

```json
{
  "bookingId": 1024,
  "status": "InProgress",
  "price": 250000,
  "amount": 250000,
  "paymentStatus": "NotCaptured",
  "eventType": "booking-status-changed"
}
```

### Event: `JobGigEvent`

Sample payload:

```json
{
  "jobGigId": 501,
  "response": {
    "bidId": 88,
    "jobGigId": 501,
    "workerId": 14,
    "amount": 220000,
    "responseType": "Offer"
  },
  "eventType": "worker-response"
}
```

### Event: `ChatMessage`

Sample payload:

```json
{
  "bookingId": 1024,
  "message": {
    "bookingMessageId": 778,
    "bookingId": 1024,
    "senderRole": "Worker",
    "senderId": 14,
    "text": "Yes, 9 AM works.",
    "sentAt": "2026-03-08T08:05:09.9022311+00:00"
  }
}
```

### Event: `UserAlert`

Sample payload:

```json
{
  "title": "New message",
  "message": "You have a new message for this booking.",
  "alertType": "new-message",
  "meta": {
    "bookingId": 1024
  },
  "createdAt": "2026-03-08T08:05:09.9022311+00:00"
}
```
