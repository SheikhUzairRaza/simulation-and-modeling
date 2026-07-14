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
        return QueueingMath.CalculateGGS(
            meanInterarrivalTime,
            meanServiceTime,
            interarrivalTimeStandardDeviation,
            serviceTimeStandardDeviation,
            numberOfServers);
    }
}
