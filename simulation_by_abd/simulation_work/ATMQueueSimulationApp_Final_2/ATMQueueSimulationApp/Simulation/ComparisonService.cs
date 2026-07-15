using System.Collections.Generic;
using ATMQueueSimulationApp.Models;

namespace ATMQueueSimulationApp.Simulation
{
    /// <summary>
    /// Runs every one of the 6 queueing models against the exact same inputs (same dataset
    /// or same custom lambda/mu/servers/customers) so their results are directly comparable.
    /// Reuses QueueModelFactory + QueueSimulationEngine - no per-model duplication here either.
    /// </summary>
    public static class ComparisonService
    {
        private static readonly QueueModelType[] AllModels =
        {
            QueueModelType.MM1, QueueModelType.MMs,
            QueueModelType.MG1, QueueModelType.MGs,
            QueueModelType.GG1, QueueModelType.GGs
        };

        public static List<SimulationResult> RunAll(
            bool useDefaultDataset,
            List<Customer>? datasetCustomers,
            double customArrivalRate,
            double customServiceRate,
            int servers,
            int numCustomers,
            int randomSeed = 12345,
            double customArrivalStdDev = 0,
            double customServiceStdDev = 0)
        {
            var engine = new QueueSimulationEngine();
            var results = new List<SimulationResult>();

            foreach (var modelType in AllModels)
            {
                var parameters = QueueModelFactory.Build(
                    modelType,
                    useDefaultDataset,
                    datasetCustomers,
                    customArrivalRate,
                    customServiceRate,
                    servers,
                    numCustomers,
                    randomSeed, // same seed for every model -> a fair, repeatable comparison
                    customArrivalStdDev,
                    customServiceStdDev);

                results.Add(engine.Run(parameters));
            }

            return results;
        }
    }
}
