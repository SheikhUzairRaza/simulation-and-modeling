using System;

namespace ATMQueueSimulationApp.Simulation
{
    /// <summary>
    /// Exponential (Markovian / memoryless) distribution - the "M" in Kendall's notation.
    /// Used for M/M/1, M/M/s, M/G/1, M/G/s arrival processes, and for M/M/1, M/M/s service.
    /// </summary>
    public class ExponentialDistribution : IDistribution
    {
        public double Mean { get; }

        public ExponentialDistribution(double mean)
        {
            if (mean <= 0) mean = 0.01; // guard against divide-by-zero / invalid input
            Mean = mean;
        }

        public double Sample(Random rng)
        {
            // Inverse-transform sampling: X = -mean * ln(U), U ~ Uniform(0,1)
            double u = 1.0 - rng.NextDouble(); // avoid ln(0)
            return -Mean * Math.Log(u);
        }

        public string Description => $"Exponential (Markovian), mean = {Mean:0.00} min";
    }
}
