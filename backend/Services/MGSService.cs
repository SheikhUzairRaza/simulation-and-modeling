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
        return QueueingMath.CalculateMGS(
            meanInterarrivalTime,
            meanServiceTime,
            serviceTimeStandardDeviation,
            numberOfServers);
    }
}
