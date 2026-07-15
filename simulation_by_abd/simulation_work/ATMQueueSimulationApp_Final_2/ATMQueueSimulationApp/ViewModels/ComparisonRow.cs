using ATMQueueSimulationApp.Simulation;

namespace ATMQueueSimulationApp.ViewModels
{
    /// <summary>
    /// One row of the Model Comparison table. Property names match the DataGrid column
    /// bindings already defined in MainWindow.xaml exactly.
    /// </summary>
    public class ComparisonRow
    {
        public string ModelName { get; }
        public string AvgWaitingTime { get; }
        public string AvgQueueLength { get; }
        public string AvgTurnaroundTime { get; }
        public string Utilization { get; }
        public string Throughput { get; }
        public string IdleTime { get; }
        public string CustomersServed { get; }

        public ComparisonRow(SimulationResult result)
        {
            ModelName = result.ModelName;
            AvgWaitingTime = $"{result.AvgWaitingTime:0.00} min";
            AvgQueueLength = $"{result.AvgQueueLength:0.00}";
            AvgTurnaroundTime = $"{result.AvgTurnaroundTime:0.00} min";
            Utilization = $"{result.ServerUtilization:P1}";
            Throughput = $"{result.Throughput:0.000}/min";
            IdleTime = $"{result.IdleTime:0.0} min";
            CustomersServed = $"{result.CustomersServed}";
        }
    }
}
