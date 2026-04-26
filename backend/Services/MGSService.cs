using QueueSimulatorAPI.Models;

namespace QueueSimulatorAPI.Services;

public class MGSService
{
    public MM1Response Calculate(
        double meanInterarrivalTime,
        double meanServiceTime,
        double serviceTimeStandardDeviation,
        int numberOfServers)
    {
        if (serviceTimeStandardDeviation < 0)
            throw new ArgumentException("Service Time Standard Deviation cannot be negative");

        double cs = serviceTimeStandardDeviation / meanServiceTime;
        double variabilityMultiplier = (1.0 + (cs * cs)) / 2.0;
        MM1Response baseResponse = QueueingMath.CalculateMMs(
            meanInterarrivalTime,
            meanServiceTime,
            numberOfServers);

        return QueueingMath.ApplyVariabilityMultiplier(baseResponse, variabilityMultiplier);
    }
}
