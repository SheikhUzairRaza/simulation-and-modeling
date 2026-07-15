using System;
using System.Collections.Generic;
using System.Linq;
using ATMQueueSimulationApp.Models;
using ATMQueueSimulationApp.Services;

namespace ATMQueueSimulationApp.Simulation
{
    /// <summary>
    /// The one and only simulation engine. Every one of the 6 queueing models (M/M/1, M/M/s,
    /// M/G/1, M/G/s, G/G/1, G/G/s) runs through this exact same code - the only thing that
    /// changes between them is which IDistribution objects and how many servers
    /// QueueModelFactory hands it in the SimulationParameters. This is how the project meets
    /// the "reuse common logic instead of duplicating code" requirement.
    ///
    /// Algorithm (standard FCFS, single shared queue, s identical servers):
    ///   For each customer, in arrival order:
    ///     - find the server that becomes free soonest
    ///     - the customer starts service at max(arrival time, that server's free time)
    ///     - the server's free time becomes (start + service time)
    /// </summary>
    public class QueueSimulationEngine
    {
        public SimulationResult Run(SimulationParameters parameters)
        {
            var rng = new Random(parameters.RandomSeed);

            List<Customer> customers = parameters.UseDefaultDataset && parameters.DatasetCustomers is not null
                ? BuildCustomersFromDataset(parameters, rng)
                : GenerateCustomers(parameters, rng);

            var serverIntervals = SimulateService(customers, parameters.NumServers);

            return StatisticsCalculator.Calculate(
                customers,
                serverIntervals,
                parameters.NumServers,
                parameters.ModelDisplayName);
        }

        /// <summary>Custom-parameter mode: generate every customer's arrival gap and service time from the configured distributions.</summary>
        private static List<Customer> GenerateCustomers(SimulationParameters parameters, Random rng)
        {
            var customers = new List<Customer>();
            double clock = 0.0;

            for (int i = 1; i <= parameters.NumCustomers; i++)
            {
                double gap = parameters.ArrivalDistribution.Sample(rng);
                clock += gap;

                customers.Add(new Customer
                {
                    CustomerId = i,
                    ArrivalTime = clock,
                    InterarrivalTime = gap,
                    ServiceTime = parameters.ServiceDistribution.Sample(rng),
                    TransactionType = "Simulated"
                });
            }

            return customers;
        }

        /// <summary>
        /// Default-dataset mode: reuse the real HBL ATM records for realism (transaction types,
        /// overall pattern), but regenerate arrival gaps / service times through the model's own
        /// distributions where the model calls for a Markovian (M) process, or reuse the actual
        /// recorded value where the model calls for a General (G) process.
        /// </summary>
        private static List<Customer> BuildCustomersFromDataset(SimulationParameters parameters, Random rng)
        {
            var source = parameters.DatasetCustomers!
                .Take(parameters.NumCustomers)
                .ToList();

            var customers = new List<Customer>();
            double clock = 0.0;

            for (int i = 0; i < source.Count; i++)
            {
                var src = source[i];

                double gap = parameters.ArrivalIsMarkovian
                    ? parameters.ArrivalDistribution.Sample(rng)
                    : src.InterarrivalTime;

                clock += gap;

                double serviceTime = parameters.ServiceIsMarkovian
                    ? parameters.ServiceDistribution.Sample(rng)
                    : src.ServiceTime;

                customers.Add(new Customer
                {
                    CustomerId = i + 1,
                    ArrivalTime = clock,
                    InterarrivalTime = gap,
                    ServiceTime = Math.Max(0.05, serviceTime),
                    TransactionType = src.TransactionType
                });
            }

            return customers;
        }

        /// <summary>Assigns each customer (already sorted by arrival time) to the earliest-available server.</summary>
        private static List<ServerInterval> SimulateService(List<Customer> customers, int numServers)
        {
            numServers = Math.Max(1, numServers);
            var serverFreeAt = new double[numServers];
            var intervals = new List<ServerInterval>(customers.Count);

            foreach (var customer in customers)
            {
                int serverIndex = 0;
                double earliestFree = serverFreeAt[0];
                for (int s = 1; s < numServers; s++)
                {
                    if (serverFreeAt[s] < earliestFree)
                    {
                        earliestFree = serverFreeAt[s];
                        serverIndex = s;
                    }
                }

                double start = Math.Max(customer.ArrivalTime, serverFreeAt[serverIndex]);
                double end = start + customer.ServiceTime;

                customer.ServiceStartTime = start;
                customer.ServiceEndTime = end;
                customer.ServerIndex = serverIndex;

                serverFreeAt[serverIndex] = end;

                intervals.Add(new ServerInterval
                {
                    ServerIndex = serverIndex,
                    CustomerId = customer.CustomerId,
                    Start = start,
                    End = end,
                    TransactionType = customer.TransactionType
                });
            }

            return intervals;
        }
    }
}
