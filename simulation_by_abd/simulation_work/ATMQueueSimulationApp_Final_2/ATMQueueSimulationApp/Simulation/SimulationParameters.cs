using System.Collections.Generic;
using ATMQueueSimulationApp.Models;

namespace ATMQueueSimulationApp.Simulation
{
    /// <summary>
    /// Everything the simulation engine needs to run one simulation. Built by
    /// QueueModelFactory so the UI never has to construct distributions by hand.
    /// </summary>
    public class SimulationParameters
    {
        public QueueModelType ModelType { get; set; }

        public int NumServers { get; set; } = 1;

        public int NumCustomers { get; set; } = 100;

        /// <summary>If true, arrival/service timing is seeded from real dataset rows.</summary>
        public bool UseDefaultDataset { get; set; }

        /// <summary>Raw dataset rows (only used when UseDefaultDataset is true).</summary>
        public List<Customer>? DatasetCustomers { get; set; }

        public required IDistribution ArrivalDistribution { get; set; }

        public required IDistribution ServiceDistribution { get; set; }

        public bool ArrivalIsMarkovian { get; set; }

        public bool ServiceIsMarkovian { get; set; }

        public int RandomSeed { get; set; } = 12345;

        public string ModelDisplayName => ModelType.ToDisplayString();
    }
}
