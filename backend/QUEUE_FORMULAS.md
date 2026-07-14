# Queueing Model Formula List

This file summarizes the formulas currently used by the backend queueing model
services.

## Common Definitions

- `lambda = 1 / meanInterarrivalTime`
- `mu = 1 / meanServiceTime`
- `rho = lambda / mu` for single-server models
- `rho = lambda / (s * mu)` for multi-server models
- `Lq` = average number in queue
- `Wq` = average waiting time in queue
- `L` = average number in system
- `W` = average time in system
- `P0` = idle probability

## M/M/1

### Inputs

- Mean inter-arrival time
- Mean service time

### Formulas

- `lambda = 1 / meanInterarrivalTime`
- `mu = 1 / meanServiceTime`
- `rho = lambda / mu`
- `Lq = rho^2 / (1 - rho)`
- `Wq = Lq / lambda`
- `W = Wq + 1 / mu`
- `L = lambda * W`
- `P0 = 1 - rho`

## M/G/1

### Inputs

- Mean inter-arrival time
- Mean service time
- Service time standard deviation, or variance

### Formulas

- `lambda = 1 / meanInterarrivalTime`
- `mu = 1 / meanServiceTime`
- `rho = lambda / mu`
- `variance = (serviceStandardDeviation)^2`
- `Lq = ((lambda^2 * variance) + rho^2) / (2 * (1 - rho))`
- `Wq = Lq / lambda`
- `W = Wq + 1 / mu`
- `L = lambda * W`
- `P0 = max(0, 1 - rho)`

## G/G/1

### Inputs

- Mean inter-arrival time
- Mean service time
- Inter-arrival standard deviation, or arrival variance
- Service time standard deviation, or service variance

### Formulas

- `lambda = 1 / meanInterarrivalTime`
- `mu = 1 / meanServiceTime`
- `rho = lambda / mu`
- `ca = interarrivalStdDev / meanInterarrivalTime`
- `cs = serviceStdDev / meanServiceTime`
- `ca^2 = ca * ca`
- `cs^2 = cs * cs`
- `denominator = 2 * (1 - rho) * (1 + rho^2 * cs^2)`
- `Lq = (rho^2 * (ca^2 + cs^2) * (ca^2 + rho^2 * cs^2)) / denominator`
- `Wq = max(0, Lq / lambda)`
- `W = Wq + 1 / mu`
- `L = lambda * W`
- `P0 = max(0, 1 - rho)`

### Notes

- The backend throws an error if the denominator becomes invalid.
- The queue length is clamped to `0` if a negative/invalid value appears.

## M/M/s

### Inputs

- Mean inter-arrival time
- Mean service time
- Number of servers `s`

### Formulas

- `lambda = 1 / meanInterarrivalTime`
- `mu = 1 / meanServiceTime`
- `rho = lambda / (s * mu)`
- `a = lambda / mu`
- `P0 = 1 / [sum(n=0 to s-1) (a^n / n!) + (a^s / (s! * (1 - rho)))]`
- `Lq = (P0 * a^s * rho) / (s! * (1 - rho)^2)`
- `Wq = Lq / lambda`
- `W = Wq + 1 / mu`
- `L = lambda * W`

## M/G/s

### Inputs

- Mean inter-arrival time
- Mean service time
- Service time standard deviation, or variance
- Number of servers `s`

### Formulas

- `lambda = 1 / meanInterarrivalTime`
- `mu = 1 / meanServiceTime`
- `rho = lambda / (s * mu)`
- `cs = serviceStdDev / meanServiceTime`
- `cs^2 = cs * cs`
- `Ca^2 = 1`
- `ErlangC = Erlang C waiting probability for M/M/s`
- `variabilityFactor = (Ca^2 + cs^2) / 2`
- `Wq = variabilityFactor * (ErlangC / (s * mu - lambda))`
- `Lq = lambda * Wq`
- `W = Wq + 1 / mu`
- `L = lambda * W`
- `P0 = idle probability from M/M/s`

### Notes

- When `s = 1`, the backend falls back to `M/G/1`.
- This is an approximation based on the M/M/s waiting structure.

## G/G/s

### Inputs

- Mean inter-arrival time
- Mean service time
- Inter-arrival standard deviation, or arrival variance
- Service time standard deviation, or service variance
- Number of servers `s`

### Formulas

- `lambda = 1 / meanInterarrivalTime`
- `mu = 1 / meanServiceTime`
- `rho = lambda / (s * mu)`
- `ca = interarrivalStdDev / meanInterarrivalTime`
- `cs = serviceStdDev / meanServiceTime`
- `ca^2 = ca * ca`
- `cs^2 = cs * cs`
- `ErlangC = Erlang C waiting probability for M/M/s`
- `variabilityFactor = (ca^2 + cs^2) / 2`
- `Wq = variabilityFactor * (ErlangC / (s * mu - lambda))`
- `Lq = lambda * Wq`
- `W = Wq + 1 / mu`
- `L = lambda * W`
- `P0 = idle probability from M/M/s`

### Notes

- When `s = 1`, the backend falls back to `G/G/1`.
- This is an approximation based on the M/M/s waiting structure.

## Erlang C Term

Used by `M/M/s`, `M/G/s`, and `G/G/s`.

- `a = lambda / mu`
- `rho = lambda / (s * mu)`
- `top = a^s / (s! * (1 - rho))`
- `denominator = sum(n=0 to s-1) (a^n / n!) + top`
- `ErlangC = top / denominator`

## Stability Rule

- Every model requires `rho < 1`
- If `rho >= 1`, the system is considered unstable

