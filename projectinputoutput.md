# Project Input Output

This guide shows simple example input values and the output values a user will see on screen for each model.

All examples below use minutes.

## Output Metrics Shown On Screen

| Output Metric | Meaning |
| --- | --- |
| Utilization | How busy the teller or tellers are |
| Idle Probability | Chance that service counters are free |
| Arrival (lambda) | Customer arrival rate |
| Service (mu) | Customer service rate |
| Spare Capacity | Extra service capacity after handling demand |
| Mean Queue Length (Lq) | Average customers waiting in line |
| Mean Queue Wait (Wq) | Average waiting time before service |
| Mean System Length (L) | Average customers in queue and service together |
| Mean System Wait (W) | Average total time in the system |

## M/M/1

### Input Values

| Field | Value |
| --- | --- |
| Mean Interarrival Time | 5 |
| Mean Service Time | 3 |

### Output Values

| Output | Value |
| --- | --- |
| Utilization | 0.6000 |
| Idle Probability | 0.4000 |
| Arrival (lambda) | 0.2000 |
| Service (mu) | 0.3333 |
| Mean Queue Length (Lq) | 0.9000 |
| Mean Queue Wait (Wq) | 4.5000 |
| Mean System Length (L) | 1.5000 |
| Mean System Wait (W) | 7.5000 |

## M/G/1

### Input Values

| Field | Value |
| --- | --- |
| Mean Interarrival Time | 5 |
| Mean Service Time | 3 |
| Service Time Standard Deviation | 1 |

### Output Values

| Output | Value |
| --- | --- |
| Utilization | 0.6000 |
| Idle Probability | 0.4000 |
| Arrival (lambda) | 0.2000 |
| Service (mu) | 0.3333 |
| Mean Queue Length (Lq) | 0.5000 |
| Mean Queue Wait (Wq) | 2.5000 |
| Mean System Length (L) | 1.1000 |
| Mean System Wait (W) | 5.5000 |

## G/G/1

### Input Values

| Field | Value |
| --- | --- |
| Mean Interarrival Time | 5 |
| Mean Service Time | 3 |
| Interarrival Time Standard Deviation | 1.5 |
| Service Time Standard Deviation | 1 |

### Output Values

| Output | Value |
| --- | --- |
| Utilization | 0.6000 |
| Idle Probability | 0.4000 |
| Arrival (lambda) | 0.2000 |
| Service (mu) | 0.3333 |
| Mean Queue Length (Lq) | 0.0905 |
| Mean Queue Wait (Wq) | 0.4525 |
| Mean System Length (L) | 0.6905 |
| Mean System Wait (W) | 3.4525 |

## M/M/s

### Input Values

| Field | Value |
| --- | --- |
| Mean Interarrival Time | 5 |
| Mean Service Time | 3 |
| Number of Servers | 3 |

### Output Values

| Output | Value |
| --- | --- |
| Utilization | 0.2000 |
| Idle Probability | 0.5479 |
| Arrival (lambda) | 0.2000 |
| Service (mu) | 0.3333 |
| Mean Queue Length (Lq) | 0.0062 |
| Mean Queue Wait (Wq) | 0.0308 |
| Mean System Length (L) | 0.6062 |
| Mean System Wait (W) | 3.0308 |

## M/G/s

### Input Values

| Field | Value |
| --- | --- |
| Mean Interarrival Time | 5 |
| Mean Service Time | 3 |
| Service Time Standard Deviation | 1 |
| Number of Servers | 3 |

### Output Values

| Output | Value |
| --- | --- |
| Utilization | 0.2000 |
| Idle Probability | 0.5479 |
| Arrival (lambda) | 0.2000 |
| Service (mu) | 0.3333 |
| Mean Queue Length (Lq) | 0.0034 |
| Mean Queue Wait (Wq) | 0.0171 |
| Mean System Length (L) | 0.6034 |
| Mean System Wait (W) | 3.0171 |

## G/G/s

### Input Values

| Field | Value |
| --- | --- |
| Mean Interarrival Time | 5 |
| Mean Service Time | 3 |
| Interarrival Time Standard Deviation | 1.5 |
| Service Time Standard Deviation | 1 |
| Number of Servers | 3 |

### Output Values

| Output | Value |
| --- | --- |
| Utilization | 0.2000 |
| Idle Probability | 0.5479 |
| Arrival (lambda) | 0.2000 |
| Service (mu) | 0.3333 |
| Mean Queue Length (Lq) | 0.0006 |
| Mean Queue Wait (Wq) | 0.0031 |
| Mean System Length (L) | 0.6006 |
| Mean System Wait (W) | 3.0031 |

## Compare Models Quickly

If you want to compare models on the frontend:

1. Enter the same main mean values first.
2. Add extra values only for the models that ask for them.
3. Compare:
   - `Mean Queue Wait (Wq)`
   - `Mean Queue Length (Lq)`
   - `Utilization`
   - `Idle Probability`
