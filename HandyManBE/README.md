## Run the API

```powershell
dotnet run --project
```

By default, the API uses the connection string in `HandyManBE/appsettings.json`.

## Code-first (EF Core) commands

From the solution root:

```powershell
dotnet ef migrations add InitialCreate --project

dotnet ef database update --project
```

If you add new seed data or change models, create a new migration and update the database again.

## API Endpoints (examples)

Base URL: `https://localhost:xxxx` (see console output when running).

- `GET /api/workers`
- `GET /api/workers/{id}`
- `POST /api/workers`
- `PUT /api/workers/{id}`
- `DELETE /api/workers/{id}`

- `GET /api/services`
- `GET /api/services/{id}`
- `POST /api/services`
- `PUT /api/services/{id}`
- `DELETE /api/services/{id}`

- `GET /api/bookings`
- `GET /api/bookings/{id}`
- `GET /api/bookings/by-worker/{workerId}`
- `GET /api/bookings/by-service/{serviceId}`
- `POST /api/bookings`
- `PUT /api/bookings/{id}`
- `PUT /api/bookings/{id}/status`
- `DELETE /api/bookings/{id}`

- `GET /api/reviews`
- `GET /api/reviews/{id}`
- `GET /api/reviews/by-worker/{workerId}`
- `GET /api/reviews/by-customer/{customerId}`
- `POST /api/reviews`
- `DELETE /api/reviews/{id}`

## Swagger UI

When running in Development, open:

```
/Swagger
```
