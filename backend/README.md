# Queue Simulator Backend

This backend exposes an ASP.NET Core API for calculating M/M/1 queueing model metrics.

## Run

From the `backend` folder:

```powershell
dotnet run
```

Default local URLs:

- `http://localhost:5196`
- `https://localhost:7195`

Swagger UI:

- `http://localhost:5196/swagger`

## Endpoint

`POST /api/Simulation/mm1`

## Input Data

Send JSON with these fields:

```json
{
  "meanInterarrivalTime": 5,
  "meanServiceTime": 3
}
```

### Input Fields

- `meanInterarrivalTime`: Average time between arrivals. Must be greater than `0`.
- `meanServiceTime`: Average service time. Must be greater than `0`.

Both values should use the same time unit, for example minutes or seconds.

## What The API Returns

The API converts the two time values into rates and returns these M/M/1 metrics:

- `lambda`: Arrival rate, calculated as `1 / meanInterarrivalTime`
- `mu`: Service rate, calculated as `1 / meanServiceTime`
- `rho`: Server utilization, calculated as `lambda / mu`
- `lq`: Average number of customers in the queue
- `wq`: Average waiting time in the queue
- `w`: Average time in the system
- `l`: Average number of customers in the system
- `idleProbability`: Probability that the server is idle

### Example Response

```json
{
  "lambda": 0.2,
  "mu": 0.3333333333333333,
  "rho": 0.6,
  "lq": 0.9,
  "wq": 4.5,
  "w": 7.5,
  "l": 1.5,
  "idleProbability": 0.4
}
```

## Validation Rules

- `meanInterarrivalTime` must be greater than `0`
- `meanServiceTime` must be greater than `0`
- The system must be stable, so `rho` must be less than `1`

If the system is unstable, the API returns a `400 Bad Request`.

## Quick Test

PowerShell:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:5196/api/Simulation/mm1" `
  -ContentType "application/json" `
  -Body '{"meanInterarrivalTime":5,"meanServiceTime":3}'
```
