# Dress the Tech Bro server

The multiplayer authority will live in `DressTechBro.Api` as an ASP.NET Core
.NET 8 service. Start with SQLite for the easiest local and single-host setup;
keep the data-access layer compatible with PostgreSQL for a managed production
database later. The API surface is intentionally small while the client slice
is being proven: health and room inspection are the first endpoints.
