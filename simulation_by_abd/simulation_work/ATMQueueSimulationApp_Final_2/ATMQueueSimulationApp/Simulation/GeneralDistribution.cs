using System;
using System.Collections.Generic;
using System.Linq;

namespace ATMQueueSimulationApp.Simulation
{
    /// <summary>
    /// General (non-Markovian) distribution - the "G" in Kendall's notation.
    /// Two ways to build one:
    ///   1) From real observed samples (e.g. the HBL ATM dataset's interarrival/service
    ///      times) -> bootstrap resampling with a small random jitter, so every run is
    ///      slightly different but stays faithful to the real data's shape.
    ///   2) From a mean + coefficient of variation (used when the user types in custom
    ///      lambda/mu with no historical data available) -> Gamma distribution, which is
    ///      the standard way to model general, non-exponential service/arrival processes.
    /// </summary>
    public class GeneralDistribution : IDistribution
    {
        private readonly List<double>? _empiricalSamples;
        private readonly double _shape;   // Gamma shape parameter (k)
        private readonly double _scale;   // Gamma scale parameter (theta)
        private readonly bool _useEmpirical;

        public double Mean { get; }

        /// <summary>Build from real historical samples (bootstrap mode).</summary>
        public GeneralDistribution(IEnumerable<double> empiricalSamples)
        {
            _empiricalSamples = empiricalSamples.Where(v => v > 0).ToList();
            if (_empiricalSamples.Count == 0) _empiricalSamples.Add(1.0);
            _useEmpirical = true;
            Mean = _empiricalSamples.Average();
            _shape = 0; _scale = 0;
        }

        /// <summary>Build from mean + coefficient of variation (parametric Gamma mode).</summary>
        public GeneralDistribution(double mean, double coefficientOfVariation = 0.5)
        {
            if (mean <= 0) mean = 0.01;
            if (coefficientOfVariation <= 0) coefficientOfVariation = 0.1;

            Mean = mean;
            _useEmpirical = false;

            // For a Gamma distribution: mean = shape * scale, cv^2 = 1 / shape
            _shape = 1.0 / (coefficientOfVariation * coefficientOfVariation);
            _scale = mean / _shape;
        }

        public double Sample(Random rng)
        {
            if (_useEmpirical)
            {
                // Bootstrap: pick a real observed value, then jitter it slightly (+/-15%)
                // using a Gaussian perturbation so repeated draws are not identical copies.
                double baseValue = _empiricalSamples![rng.Next(_empiricalSamples.Count)];
                double jitterStdDev = baseValue * 0.15;
                double jittered = baseValue + (SampleStandardNormal(rng) * jitterStdDev);
                return Math.Max(0.05, jittered);
            }

            return Math.Max(0.05, SampleGamma(rng, _shape, _scale));
        }

        public string Description => _useEmpirical
            ? $"General (empirical/bootstrap), mean = {Mean:0.00} min"
            : $"General (Gamma), mean = {Mean:0.00} min, shape = {_shape:0.00}";

        /// <summary>Standard normal sample via Box-Muller transform.</summary>
        private static double SampleStandardNormal(Random rng)
        {
            double u1 = 1.0 - rng.NextDouble();
            double u2 = rng.NextDouble();
            return Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Sin(2.0 * Math.PI * u2);
        }

        /// <summary>
        /// Gamma(shape, scale) sampling using the Marsaglia-Tsang method (fast, widely used,
        /// valid for shape >= 1; for shape &lt; 1 we boost then correct, per the standard trick).
        /// </summary>
        private static double SampleGamma(Random rng, double shape, double scale)
        {
            if (shape < 1.0)
            {
                double u = rng.NextDouble();
                return SampleGamma(rng, shape + 1.0, scale) * Math.Pow(u, 1.0 / shape);
            }

            double d = shape - (1.0 / 3.0);
            double c = 1.0 / Math.Sqrt(9.0 * d);

            while (true)
            {
                double x, v;
                do
                {
                    x = SampleStandardNormal(rng);
                    v = 1.0 + (c * x);
                } while (v <= 0);

                v = v * v * v;
                double u2 = rng.NextDouble();

                if (u2 < 1.0 - (0.0331 * x * x * x * x)) return d * v * scale;
                if (Math.Log(u2) < (0.5 * x * x) + (d * (1.0 - v + Math.Log(v)))) return d * v * scale;
            }
        }
    }
}
