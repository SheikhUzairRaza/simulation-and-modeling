using QueueSimulatorAPI.Models;

namespace QueueSimulatorAPI.Services;

public class MM1Service
{
    public MM1Response Calculate(double meanInterarrivalTime, double meanServiceTime)
    {
        return QueueingMath.CalculateMMs(meanInterarrivalTime, meanServiceTime, 1);
    }
}
