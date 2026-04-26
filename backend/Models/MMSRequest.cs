using System.ComponentModel.DataAnnotations;

namespace QueueSimulatorAPI.Models;

public class MMSRequest
{
    [Required]
    [Range(0.0001, double.MaxValue, ErrorMessage = "Mean Interarrival Time must be greater than 0")]
    public double MeanInterarrivalTime { get; set; }

    [Required]
    [Range(0.0001, double.MaxValue, ErrorMessage = "Mean Service Time must be greater than 0")]
    public double MeanServiceTime { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Number Of Servers must be at least 1")]
    public int NumberOfServers { get; set; }
}
