# Queue Simulator Backend

This backend provides an ASP.NET Core API to calculate M/M/1 queueing model metrics.

## How to Run

Open a terminal in the `backend` folder and run:

```powershell
dotnet run
```

The API starts on:

- `http://localhost:5196`
- `https://localhost:7195`

Swagger:

- `http://localhost:5196/swagger`

## API Endpoint

`POST /api/Simulation/mm1`

## Input

Send this JSON:

```json
{
  "meanInterarrivalTime": 5,
  "meanServiceTime": 3
}
```

### Meaning of Input

- `meanInterarrivalTime`: average time between arrivals
- `meanServiceTime`: average service time

Rules:

- both values must be greater than `0`
- both values should use the same unit, such as minutes or seconds

## Output

The API returns:

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

### Meaning of Output

- `lambda`: arrival rate
- `mu`: service rate
- `rho`: utilization
- `lq`: average number in queue
- `wq`: average waiting time in queue
- `w`: average time in system
- `l`: average number in system
- `idleProbability`: probability that the server is idle

## Error Case

The API returns `400 Bad Request` if:

- input values are not greater than `0`
- the system is unstable and `rho >= 1`

## Quick Test

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:5196/api/Simulation/mm1" `
  -ContentType "application/json" `
  -Body '{"meanInterarrivalTime":5,"meanServiceTime":3}'
```
