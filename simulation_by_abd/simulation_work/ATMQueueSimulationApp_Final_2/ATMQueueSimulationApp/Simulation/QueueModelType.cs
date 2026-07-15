using System;

namespace ATMQueueSimulationApp.Simulation
{
    /// <summary>
    /// The six queueing models the application supports (Kendall's notation: Arrival/Service/Servers).
    /// </summary>
    public enum QueueModelType
    {
        MM1,   // M/M/1  - Markovian arrivals, Markovian service, 1 server
        MMs,   // M/M/s  - Markovian arrivals, Markovian service, s servers
        MG1,   // M/G/1  - Markovian arrivals, General service, 1 server
        MGs,   // M/G/s  - Markovian arrivals, General service, s servers
        GG1,   // G/G/1  - General arrivals, General service, 1 server
        GGs    // G/G/s  - General arrivals, General service, s servers
    }

    /// <summary>Small helper for converting to/from the display strings used in the UI dropdown.</summary>
    public static class QueueModelTypeExtensions
    {
        public static string ToDisplayString(this QueueModelType type) => type switch
        {
            QueueModelType.MM1 => "M/M/1",
            QueueModelType.MMs => "M/M/s",
            QueueModelType.MG1 => "M/G/1",
            QueueModelType.MGs => "M/G/s",
            QueueModelType.GG1 => "G/G/1",
            QueueModelType.GGs => "G/G/s",
            _ => type.ToString()
        };

        public static QueueModelType FromDisplayString(string text) => text.Trim() switch
        {
            "M/M/1" => QueueModelType.MM1,
            "M/M/s" => QueueModelType.MMs,
            "M/G/1" => QueueModelType.MG1,
            "M/G/s" => QueueModelType.MGs,
            "G/G/1" => QueueModelType.GG1,
            "G/G/s" => QueueModelType.GGs,
            _ => throw new ArgumentException($"Unknown queue model: {text}")
        };

        /// <summary>True if this model uses s (possibly > 1) servers rather than being fixed to 1.</summary>
        public static bool IsMultiServer(this QueueModelType type) =>
            type is QueueModelType.MMs or QueueModelType.MGs or QueueModelType.GGs;

        /// <summary>True if the arrival process is Markovian (exponential).</summary>
        public static bool HasMarkovianArrivals(this QueueModelType type) =>
            type is QueueModelType.MM1 or QueueModelType.MMs or QueueModelType.MG1 or QueueModelType.MGs;

        /// <summary>True if the service process is Markovian (exponential).</summary>
        public static bool HasMarkovianService(this QueueModelType type) =>
            type is QueueModelType.MM1 or QueueModelType.MMs;
    }
}
