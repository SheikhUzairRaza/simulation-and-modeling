using System;
using System.Collections.Generic;
using System.Linq;
using ATMQueueSimulationApp.Models;

namespace ATMQueueSimulationApp.Simulation
{
    /// <summary>
    /// Builds a ready-to-run SimulationParameters object for any of the 6 models.
    /// This is the only place in the app that decides "M means exponential, G means general" -
    /// everything downstream (the engine, the stats calculator) is model-agnostic.
    /// </summary>
    public static class QueueModelFactory
    {
        public static SimulationParameters Build(
            QueueModelType modelType,
            bool useDefaultDataset,
            List<Customer>? datasetCustomers,
            double customArrivalRate,   // lambda, customers/min - only used when useDefaultDataset == false
            double customServiceRate,   // mu, customers/min - only used when useDefaultDataset == false
            int requestedServers,
            int requestedCustomers,
            int randomSeed = 12345,
            double customArrivalStdDev = 0, // sigma_a, minutes - only used for General arrivals (G/G) with custom inputs
            double customServiceStdDev = 0) // sigma_s, minutes - only used for General service (M/G, G/G) with custom inputs
        {
            bool arrivalMarkovian = modelType.HasMarkovianArrivals();
            bool serviceMarkovian = modelType.HasMarkovianService();

            // Single-server models are always forced to 1 server, regardless of what
            // was typed in the "Number of Servers" box - this keeps the model honest.
            int numServers = modelType.IsMultiServer() ? Math.Max(1, requestedServers) : 1;

            IDistribution arrivalDistribution;
            IDistribution serviceDistribution;
            int numCustomers;

            if (useDefaultDataset)
            {
                if (datasetCustomers is null || datasetCustomers.Count == 0)
                    throw new InvalidOperationException("Default dataset was requested but no dataset rows were loaded.");

                numCustomers = Math.Min(requestedCustomers, datasetCustomers.Count);

                double meanInterarrival = datasetCustomers.Average(c => c.InterarrivalTime);
                double meanService = datasetCustomers.Average(c => c.ServiceTime);

                // Markovian side -> fit an exponential to the dataset's observed mean.
                // General side -> bootstrap directly from the dataset's real values.
                arrivalDistribution = arrivalMarkovian
                    ? new ExponentialDistribution(meanInterarrival)
                    : new GeneralDistribution(datasetCustomers.Select(c => c.InterarrivalTime));

                serviceDistribution = serviceMarkovian
                    ? new ExponentialDistribution(meanService)
                    : new GeneralDistribution(datasetCustomers.Select(c => c.ServiceTime));
            }
            else
            {
                if (customArrivalRate <= 0) customArrivalRate = 0.1;
                if (customServiceRate <= 0) customServiceRate = 0.1;

                numCustomers = Math.Max(1, requestedCustomers);

                double meanInterarrival = 1.0 / customArrivalRate;
                double meanService = 1.0 / customServiceRate;

                // Markovian side -> plain exponential from the typed-in rate.
                // General side -> Gamma distribution around the same mean. The shape of the
                // Gamma is driven by the coefficient of variation (CV = sigma / mean). If the
                // user typed in an arrival/service standard deviation, use it; otherwise fall
                // back to a moderate default (cv = 0.5), a realistic, less-random-than-exponential
                // process, since there is no historical data to derive variability from here.
                double arrivalCv = customArrivalStdDev > 0 ? customArrivalStdDev / meanInterarrival : 0.5;
                double serviceCv = customServiceStdDev > 0 ? customServiceStdDev / meanService : 0.5;

                arrivalDistribution = arrivalMarkovian
                    ? new ExponentialDistribution(meanInterarrival)
                    : new GeneralDistribution(meanInterarrival, coefficientOfVariation: arrivalCv);

                serviceDistribution = serviceMarkovian
                    ? new ExponentialDistribution(meanService)
                    : new GeneralDistribution(meanService, coefficientOfVariation: serviceCv);
            }

            return new SimulationParameters
            {
                ModelType = modelType,
                NumServers = numServers,
                NumCustomers = numCustomers,
                UseDefaultDataset = useDefaultDataset,
                DatasetCustomers = datasetCustomers,
                ArrivalDistribution = arrivalDistribution,
                ServiceDistribution = serviceDistribution,
                ArrivalIsMarkovian = arrivalMarkovian,
                ServiceIsMarkovian = serviceMarkovian,
                RandomSeed = randomSeed
            };
        }
    }
}
