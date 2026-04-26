using QueueSimulatorAPI.Models;

namespace QueueSimulatorAPI.Services;

public class MMSService
{
    public MM1Response Calculate(double meanInterarrivalTime, double meanServiceTime, int numberOfServers)
    {
        return QueueingMath.CalculateMMs(meanInterarrivalTime, meanServiceTime, numberOfServers);
    }
}
