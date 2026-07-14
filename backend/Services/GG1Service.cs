using QueueSimulatorAPI.Models;

namespace QueueSimulatorAPI.Services;

public class GG1Service
{
    public MM1Response Calculate(
        double meanInterarrivalTime,
        double meanServiceTime,
        double interarrivalTimeStandardDeviation,
        double serviceTimeStandardDeviation)
    {
        return QueueingMath.CalculateGG1(
            meanInterarrivalTime,
            meanServiceTime,
            interarrivalTimeStandardDeviation,
            serviceTimeStandardDeviation);
    }
}
