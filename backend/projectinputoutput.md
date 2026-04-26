# Project Input Output

This backend calculates M/M/1 queueing model results from two input values.

## Input

Send a `POST` request to:

`/api/Simulation/mm1`

### Request Body

```json
{
  "meanInterarrivalTime": 5,
  "meanServiceTime": 3
}
```

### Input Fields

- `meanInterarrivalTime`: average time between arrivals
- `meanServiceTime`: average service time

### Input Rules

- both values must be greater than `0`
- both values must use the same time unit

Example:

- if `meanInterarrivalTime` is in minutes, then `meanServiceTime` must also be in minutes

## Output

The API returns calculated queueing metrics in JSON.

### Response Body

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

### Output Fields

- `lambda`: arrival rate
- `mu`: service rate
- `rho`: utilization of the server
- `lq`: average number of customers in queue
- `wq`: average waiting time in queue
- `w`: average time in the system
- `l`: average number of customers in the system
- `idleProbability`: probability that the server is idle

## Error Output

The API returns `400 Bad Request` if:

- `meanInterarrivalTime <= 0`
- `meanServiceTime <= 0`
- `rho >= 1`, which means the system is unstable
