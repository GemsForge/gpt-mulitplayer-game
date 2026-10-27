var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));
var app = builder.Build();
app.UseCors();
app.MapGet("/health", () => Results.Ok(new { service = "dress-the-tech-bro", status = "ok" }));
app.MapGet("/api/rooms/{roomCode}", (string roomCode) => Results.Ok(new { roomCode, phase = "customizing", players = 3 }));
app.Run();
