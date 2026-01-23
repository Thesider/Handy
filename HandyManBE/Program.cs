using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddOpenApi();

builder.Services.AddDbContext<HandyManBE.Data.ApplicationDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseSqlServer(connectionString);
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? string.Empty))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddSingleton<IPasswordHasher<object>, PasswordHasher<object>>();

builder.Services.AddScoped<HandyManBE.DAO.IWorkerDao, HandyManBE.DAO.WorkerDao>();
builder.Services.AddScoped<HandyManBE.DAO.IServiceDao, HandyManBE.DAO.ServiceDao>();
builder.Services.AddScoped<HandyManBE.DAO.IBookingDao, HandyManBE.DAO.BookingDao>();
builder.Services.AddScoped<HandyManBE.DAO.IReviewDao, HandyManBE.DAO.ReviewDao>();

builder.Services.AddScoped<HandyManBE.Services.IWorkerService, HandyManBE.Services.WorkerAppService>();
builder.Services.AddScoped<HandyManBE.Services.IServiceAppService, HandyManBE.Services.ServiceAppService>();
builder.Services.AddScoped<HandyManBE.Services.IBookingService, HandyManBE.Services.BookingAppService>();
builder.Services.AddScoped<HandyManBE.Services.IReviewService, HandyManBE.Services.ReviewAppService>();
builder.Services.AddScoped<HandyManBE.Services.IJobGigService, HandyManBE.Services.JobGigService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("Frontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


app.Run();


