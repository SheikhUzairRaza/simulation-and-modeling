using QueueSimulatorAPI.Models;

namespace QueueSimulatorAPI.Services;

public class GGSService
{
    public MM1Response Calculate(
        double meanInterarrivalTime,
        double meanServiceTime,
        double interarrivalTimeStandardDeviation,
        double serviceTimeStandardDeviation,
        int numberOfServers)
    {
        if (interarrivalTimeStandardDeviation < 0)
            throw new ArgumentException("Interarrival Time Standard Deviation cannot be negative");

        if (serviceTimeStandardDeviation < 0)
            throw new ArgumentException("Service Time Standard Deviation cannot be negative");

        double ca = interarrivalTimeStandardDeviation / meanInterarrivalTime;
        double cs = serviceTimeStandardDeviation / meanServiceTime;
        double variabilityMultiplier = ((ca * ca) + (cs * cs)) / 2.0;
        MM1Response baseResponse = QueueingMath.CalculateMMs(
            meanInterarrivalTime,
            meanServiceTime,
            numberOfServers);

        return QueueingMath.ApplyVariabilityMultiplier(baseResponse, variabilityMultiplier);
    }
}
