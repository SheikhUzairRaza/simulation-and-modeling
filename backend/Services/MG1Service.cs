using QueueSimulatorAPI.Models;

namespace QueueSimulatorAPI.Services;

public class MG1Service
{
    public MM1Response Calculate(
        double meanInterarrivalTime,
        double meanServiceTime,
        double serviceTimeStandardDeviation)
    {
        return new MGSService().Calculate(
            meanInterarrivalTime,
            meanServiceTime,
            serviceTimeStandardDeviation,
            1);
    }
}
