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
        return new GGSService().Calculate(
            meanInterarrivalTime,
            meanServiceTime,
            interarrivalTimeStandardDeviation,
            serviceTimeStandardDeviation,
            1);
    }
}
