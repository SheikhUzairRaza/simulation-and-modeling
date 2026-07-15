using System;
using System.Collections.Generic;
using System.Linq;
using ATMQueueSimulationApp.Models;
using ATMQueueSimulationApp.Simulation;

namespace ATMQueueSimulationApp.Services
{
    /// <summary>
    /// Turns the raw output of a simulation run (served customers + server busy intervals)
    /// into the full set of KPIs shown in the Results panel, plus the queue-length timeline
    /// used for the "Queue Length vs Time" chart and a readable simulation log.
    /// Kept as one small, reusable class instead of duplicating this math inside every model.
    /// </summary>
    public static class StatisticsCalculator
    {
        public static SimulationResult Calculate(
            List<Customer> customers,
            List<ServerInterval> serverIntervals,
            int numServers,
            string modelName)
        {
            var result = new SimulationResult
            {
                ModelName = modelName,
                Customers = customers,
                ServerIntervals = serverIntervals,
                NumServers = numServers,
                CustomersServed = customers.Count
            };

            if (customers.Count == 0)
            {
                result.LogLines.Add("[Warning] No customers were simulated - check input parameters.");
                return result;
            }

            // ---- Basic time-averaged KPIs ----
            result.AvgWaitingTime = customers.Average(c => c.WaitingTime);
            result.AvgServiceTime = customers.Average(c => c.ServiceTime);
            result.AvgTurnaroundTime = customers.Average(c => c.TurnaroundTime);

            double firstArrival = customers.Min(c => c.ArrivalTime);
            double lastDeparture = customers.Max(c => c.ServiceEndTime);
            double totalTime = Math.Max(0.01, lastDeparture - firstArrival);
            result.TotalSimulationTime = totalTime;

            // ---- Queue-length timeline (time-weighted) ----
            // Event list: +1 when a customer arrives, -1 the moment a customer's service begins
            // (i.e. the moment it leaves the *waiting* queue - this is the standard Lq definition).
            var events = new List<(double Time, int Delta)>();
            foreach (var c in customers)
            {
                events.Add((c.ArrivalTime, +1));
                events.Add((c.ServiceStartTime, -1));
            }
            events.Sort((a, b) => a.Time.CompareTo(b.Time));

            int currentQueue = 0;
            int maxQueue = 0;
            double weightedQueueArea = 0.0;
            double previousTime = firstArrival;
            var timeline = new List<QueueSnapshot>();

            foreach (var ev in events)
            {
                double dt = ev.Time - previousTime;
                if (dt > 0) weightedQueueArea += currentQueue * dt;

                currentQueue = Math.Max(0, currentQueue + ev.Delta);
                maxQueue = Math.Max(maxQueue, currentQueue);
                timeline.Add(new QueueSnapshot { Time = ev.Time, QueueLength = currentQueue });

                previousTime = ev.Time;
            }

            result.QueueTimeline = timeline;
            result.MaxQueueLength = maxQueue;
            result.AvgQueueLength = weightedQueueArea / totalTime;

            // ---- Server utilization / idle time ----
            double totalBusyTime = serverIntervals.Sum(s => s.End - s.Start);
            double totalServerCapacityTime = numServers * totalTime;
            result.ServerUtilization = totalServerCapacityTime > 0
                ? Math.Min(1.0, totalBusyTime / totalServerCapacityTime)
                : 0;
            result.IdleTime = Math.Max(0, totalServerCapacityTime - totalBusyTime);

            // ---- Probability of waiting & throughput ----
            int waitedCount = customers.Count(c => c.WaitingTime > 1e-6);
            result.ProbabilityOfWaiting = (double)waitedCount / customers.Count;
            result.Throughput = customers.Count / totalTime;

            // ---- Human-readable log (first 40 customers, then a summary) ----
            result.LogLines.Add($"[Model] {modelName} | Servers = {numServers} | Customers = {customers.Count}");
            foreach (var c in customers.Take(40))
            {
                result.LogLines.Add(
                    $"Customer #{c.CustomerId,-4} arrived at {c.ArrivalTime,7:0.00} | " +
                    $"served by S{c.ServerIndex + 1} at {c.ServiceStartTime,7:0.00} | " +
                    $"waited {c.WaitingTime,6:0.00} | service {c.ServiceTime,5:0.00} | " +
                    $"left at {c.ServiceEndTime,7:0.00} | {c.TransactionType}");
            }
            if (customers.Count > 40)
                result.LogLines.Add($"... ({customers.Count - 40} more customers not shown in log) ...");

            result.LogLines.Add(
                $"[Summary] AvgWait={result.AvgWaitingTime:0.00} min | " +
                $"AvgQueue={result.AvgQueueLength:0.00} | MaxQueue={result.MaxQueueLength} | " +
                $"Utilization={result.ServerUtilization:P1} | Throughput={result.Throughput:0.000}/min");

            return result;
        }
    }
}
