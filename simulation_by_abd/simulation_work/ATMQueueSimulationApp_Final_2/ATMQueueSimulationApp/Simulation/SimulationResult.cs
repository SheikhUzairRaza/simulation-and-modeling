using System.Collections.Generic;
using ATMQueueSimulationApp.Models;

namespace ATMQueueSimulationApp.Simulation
{
    /// <summary>One point on the "Queue Length vs Time" chart.</summary>
    public class QueueSnapshot
    {
        public double Time { get; set; }
        public int QueueLength { get; set; }
    }

    /// <summary>One "busy block" for a server, used to draw the Gantt chart.</summary>
    public class ServerInterval
    {
        public int ServerIndex { get; set; }
        public int CustomerId { get; set; }
        public double Start { get; set; }
        public double End { get; set; }
        public string TransactionType { get; set; } = "";
    }

    /// <summary>
    /// Full output of a single simulation run: raw per-customer data, per-server timeline,
    /// queue-length-over-time series, the computed KPIs, and a human-readable log.
    /// This same object is reused by every one of the 6 models and by the comparison screen.
    /// </summary>
    public class SimulationResult
    {
        public string ModelName { get; set; } = "";

        public List<Customer> Customers { get; set; } = new();
        public List<QueueSnapshot> QueueTimeline { get; set; } = new();
        public List<ServerInterval> ServerIntervals { get; set; } = new();
        public List<string> LogLines { get; set; } = new();

        public int NumServers { get; set; }

        // ---- KPIs (all required by the Results panel) ----
        public double AvgWaitingTime { get; set; }
        public double AvgServiceTime { get; set; }
        public double AvgTurnaroundTime { get; set; }
        public double AvgQueueLength { get; set; }
        public int MaxQueueLength { get; set; }
        public double ServerUtilization { get; set; }      // 0..1
        public double IdleTime { get; set; }                // total idle minutes across all servers
        public double ProbabilityOfWaiting { get; set; }    // 0..1
        public double Throughput { get; set; }              // customers per minute
        public int CustomersServed { get; set; }
        public double TotalSimulationTime { get; set; }     // minutes
    }
}
