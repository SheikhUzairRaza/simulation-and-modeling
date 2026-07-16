using System.ComponentModel.DataAnnotations;

namespace QueueSimulatorAPI.Models;

public class MM1Request
{
    [Range(0.0000001, double.MaxValue, ErrorMessage = "Mean inter-arrival time must be greater than 0")]
    public double MeanInterarrivalTime { get; set; }

    [Range(0.0000001, double.MaxValue, ErrorMessage = "Mean service time must be greater than 0")]
    public double MeanServiceTime { get; set; }
}
