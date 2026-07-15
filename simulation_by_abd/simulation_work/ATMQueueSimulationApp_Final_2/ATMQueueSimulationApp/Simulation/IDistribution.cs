namespace ATMQueueSimulationApp.Simulation
{
    /// <summary>
    /// A samplable random process used for either the arrival process or the service
    /// process of a queueing model. Implementations: ExponentialDistribution (the "M" in
    /// M/M/1, M/G/1 ...) and GeneralDistribution (the "G" in M/G/1, G/G/1 ...).
    /// Having a single interface means the simulation engine never needs to know or care
    /// which letter (M or G) it is dealing with - that is the whole point of this abstraction.
    /// </summary>
    public interface IDistribution
    {
        double Sample(Random rng);

        /// <summary>Short human-readable description, shown in the simulation log.</summary>
        string Description { get; }

        /// <summary>Theoretical/estimated mean of this distribution (minutes).</summary>
        double Mean { get; }
    }
}
