using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using ATMQueueSimulationApp.Charts;
using ATMQueueSimulationApp.Models;
using ATMQueueSimulationApp.Services;
using ATMQueueSimulationApp.Simulation;
using ATMQueueSimulationApp.ViewModels;

namespace ATMQueueSimulationApp
{
    public partial class MainWindow : Window
    {
        // The dataset currently loaded - either the bundled default HBL ATM data,
        // or a freshly generated random dataset from the "Generate Random Dataset" button.
        private List<Customer> _activeDataset = new();

        private readonly QueueSimulationEngine _engine = new();

        // Kept around purely so charts can be rebuilt without re-running the simulation.
        private SimulationResult? _lastResult;
        private List<SimulationResult>? _lastComparisonResults;

        public MainWindow()
        {
            InitializeComponent();

            DefaultDatasetRadio.Checked += (_, _) => SetCustomInputsEnabled(false);
            CustomDatasetRadio.Checked += (_, _) => SetCustomInputsEnabled(true);
            SetCustomInputsEnabled(false);

            ModelComboBox.SelectionChanged += (_, _) => UpdateStdDevFieldsVisibility();
            UpdateStdDevFieldsVisibility();

            RunSimulationButton.Click += RunSimulationButton_Click;
            CompareAllButton.Click += CompareAllButton_Click;
            GenerateRandomDatasetButton.Click += GenerateRandomDatasetButton_Click;
            ResetButton.Click += ResetButton_Click;

            LoadDefaultDatasetIntoApp();
        }

        private void LoadDefaultDatasetIntoApp()
        {
            try
            {
                _activeDataset = DatasetService.LoadDefaultDataset();
                StatusText.Text = $"Loaded default HBL ATM dataset — {_activeDataset.Count} customer records.";
                SimulationLogListBox.Items.Add($"[Ready] Default dataset loaded: {_activeDataset.Count} records from atm_dataset.csv.");
                SimulationLogListBox.Items.Add("[Ready] Choose a model and click Run Simulation, or switch to Custom Inputs.");
            }
            catch (Exception ex)
            {
                StatusText.Text = "Could not load default dataset — see log.";
                SimulationLogListBox.Items.Add($"[Error] {ex.Message}");
            }
        }

        private void SetCustomInputsEnabled(bool enabled)
        {
            // When "Default ATM Dataset" is selected, arrival/service rate (and std dev)
            // boxes are derived from the dataset instead of being typed in directly.
            ArrivalRateTextBox.IsEnabled = enabled;
            ServiceRateTextBox.IsEnabled = enabled;
            ArrivalStdDevTextBox.IsEnabled = enabled;
            ServiceStdDevTextBox.IsEnabled = enabled;
        }

        /// <summary>
        /// Shows the Arrival/Service Standard Deviation fields only for the General ("G")
        /// side of whichever model is currently selected: hidden for M/M/1 and M/M/s,
        /// service-only for M/G/1 and M/G/s, and both for G/G/1 and G/G/s.
        /// </summary>
        private void UpdateStdDevFieldsVisibility()
        {
            var modelType = QueueModelTypeExtensions.FromDisplayString(
                (ModelComboBox.SelectedItem as ComboBoxItem)?.Content?.ToString() ?? "M/M/1");

            var arrivalVisibility = modelType.HasMarkovianArrivals() ? Visibility.Collapsed : Visibility.Visible;
            var serviceVisibility = modelType.HasMarkovianService() ? Visibility.Collapsed : Visibility.Visible;

            ArrivalStdDevLabel.Visibility = arrivalVisibility;
            ArrivalStdDevTextBox.Visibility = arrivalVisibility;

            ServiceStdDevLabel.Visibility = serviceVisibility;
            ServiceStdDevTextBox.Visibility = serviceVisibility;
        }

        // ================= RUN SIMULATION (single model) =================

        private void RunSimulationButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var modelType = QueueModelTypeExtensions.FromDisplayString(
                    (ModelComboBox.SelectedItem as ComboBoxItem)?.Content?.ToString() ?? "M/M/1");

                bool useDefaultDataset = DefaultDatasetRadio.IsChecked == true;

                if (useDefaultDataset && _activeDataset.Count == 0)
                {
                    MessageBox.Show("No dataset is loaded. Try 'Generate Random Dataset' or switch to Custom Inputs.",
                        "ATM Queue Simulation", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                double arrivalRate = ParseDouble(ArrivalRateTextBox.Text, 0.40);
                double serviceRate = ParseDouble(ServiceRateTextBox.Text, 0.55);
                int servers = ParseInt(ServersTextBox.Text, 1);
                int numCustomers = ParseInt(CustomersTextBox.Text, 120);

                // Only meaningful for General (G) models with Custom Inputs; a fallback of 0
                // tells QueueModelFactory to use its default variability instead.
                double arrivalStdDev = useDefaultDataset ? 0 : ParseDouble(ArrivalStdDevTextBox.Text, 0);
                double serviceStdDev = useDefaultDataset ? 0 : ParseDouble(ServiceStdDevTextBox.Text, 0);

                var parameters = QueueModelFactory.Build(
                    modelType,
                    useDefaultDataset,
                    useDefaultDataset ? _activeDataset : null,
                    arrivalRate,
                    serviceRate,
                    servers,
                    numCustomers,
                    randomSeed: 12345,
                    customArrivalStdDev: arrivalStdDev,
                    customServiceStdDev: serviceStdDev);

                var result = _engine.Run(parameters);
                _lastResult = result;

                DisplayResult(result);
                UpdateChartsForSingleRun(result);

                StatusText.Text = $"Simulation complete — {result.ModelName}, {result.CustomersServed} customers served.";
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Simulation failed: {ex.Message}", "ATM Queue Simulation",
                    MessageBoxButton.OK, MessageBoxImage.Error);
                StatusText.Text = "Simulation failed — see message.";
            }
        }

        /// <summary>Pushes a SimulationResult's KPIs and log into the Results panel and log list.</summary>
        private void DisplayResult(SimulationResult result)
        {
            AvgWaitingTimeText.Text = $"{result.AvgWaitingTime:0.00} min";
            AvgServiceTimeText.Text = $"{result.AvgServiceTime:0.00} min";
            AvgTurnaroundTimeText.Text = $"{result.AvgTurnaroundTime:0.00} min";
            AvgQueueLengthText.Text = $"{result.AvgQueueLength:0.00}";
            MaxQueueLengthText.Text = $"{result.MaxQueueLength}";
            UtilizationText.Text = $"{result.ServerUtilization:P1}";
            IdleTimeText.Text = $"{result.IdleTime:0.0} min";
            ProbWaitingText.Text = $"{result.ProbabilityOfWaiting:P1}";
            ThroughputText.Text = $"{result.Throughput:0.000}/min";
            CustomersServedText.Text = $"{result.CustomersServed}";
            TotalSimTimeText.Text = $"{result.TotalSimulationTime:0.0} min";
            ActiveModelText.Text = result.ModelName;

            SimulationLogListBox.Items.Clear();
            foreach (var line in result.LogLines)
                SimulationLogListBox.Items.Add(line);

            if (SimulationLogListBox.Items.Count > 0)
                SimulationLogListBox.ScrollIntoView(SimulationLogListBox.Items[^1]);
        }

        /// <summary>Builds and displays all 5 per-model charts for a single simulation run.</summary>
        private void UpdateChartsForSingleRun(SimulationResult result)
        {
            try
            {
                QueueLengthChartHost.Child = ChartFactory.BuildQueueLengthChart(result);
                WaitingTimeHistogramHost.Child = ChartFactory.BuildWaitingTimeHistogram(result);
                UtilizationChartHost.Child = ChartFactory.BuildUtilizationChart(result);
                TurnaroundChartHost.Child = ChartFactory.BuildTurnaroundDistributionChart(result);
                GanttChartHost.Child = GanttChartBuilder.Build(result);

                // A single-model run has nothing to compare - leave a friendly placeholder there.
                ComparisonChartHost.Child = new TextBlock
                {
                    Text = "Click 'Compare All Models' to see a side-by-side chart of all 6 models.",
                    Margin = new Thickness(12),
                    TextWrapping = TextWrapping.Wrap,
                    Foreground = System.Windows.Media.Brushes.Gray
                };
            }
            catch (Exception ex)
            {
                SimulationLogListBox.Items.Add($"[Warning] Charts could not be drawn: {ex.Message}");
            }
        }

        // ================= COMPARE ALL MODELS =================

        private void CompareAllButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                bool useDefaultDataset = DefaultDatasetRadio.IsChecked == true;

                if (useDefaultDataset && _activeDataset.Count == 0)
                {
                    MessageBox.Show("No dataset is loaded. Try 'Generate Random Dataset' or switch to Custom Inputs.",
                        "ATM Queue Simulation", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                double arrivalRate = ParseDouble(ArrivalRateTextBox.Text, 0.40);
                double serviceRate = ParseDouble(ServiceRateTextBox.Text, 0.55);
                int servers = ParseInt(ServersTextBox.Text, 2); // multi-server models need s > 1 to be meaningful
                int numCustomers = ParseInt(CustomersTextBox.Text, 120);

                double arrivalStdDev = useDefaultDataset ? 0 : ParseDouble(ArrivalStdDevTextBox.Text, 0);
                double serviceStdDev = useDefaultDataset ? 0 : ParseDouble(ServiceStdDevTextBox.Text, 0);

                var results = ComparisonService.RunAll(
                    useDefaultDataset,
                    useDefaultDataset ? _activeDataset : null,
                    arrivalRate,
                    serviceRate,
                    servers,
                    numCustomers,
                    randomSeed: 12345,
                    customArrivalStdDev: arrivalStdDev,
                    customServiceStdDev: serviceStdDev);

                _lastComparisonResults = results;

                // Populate the comparison table (bottom panel)
                var rows = results.Select(r => new ComparisonRow(r)).ToList();
                ComparisonDataGrid.ItemsSource = rows;

                // Populate the comparison chart (right panel, "Model Comparison" tab)
                ComparisonChartHost.Child = ChartFactory.BuildComparisonChart(results);
                ChartsTabControl.SelectedIndex = ChartsTabControl.Items.Count - 1; // jump to the comparison tab

                // Log a readable summary of all 6 runs
                SimulationLogListBox.Items.Clear();
                SimulationLogListBox.Items.Add($"[Compare All Models] Ran all 6 models with {numCustomers} customers, {servers} server(s) where applicable.");
                foreach (var r in results)
                {
                    SimulationLogListBox.Items.Add(
                        $"{r.ModelName,-6} | AvgWait={r.AvgWaitingTime,6:0.00} | AvgQueue={r.AvgQueueLength,5:0.00} | " +
                        $"Util={r.ServerUtilization,7:P1} | Throughput={r.Throughput:0.000}/min | Served={r.CustomersServed}");
                }

                StatusText.Text = "Comparison complete — see the table below and the 'Model Comparison' chart tab.";
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Comparison failed: {ex.Message}", "ATM Queue Simulation",
                    MessageBoxButton.OK, MessageBoxImage.Error);
                StatusText.Text = "Comparison failed — see message.";
            }
        }

        // ================= DATASET BUTTONS =================

        private void GenerateRandomDatasetButton_Click(object sender, RoutedEventArgs e)
        {
            int count = ParseInt(CustomersTextBox.Text, 130);
            _activeDataset = DatasetService.GenerateRandomDataset(Math.Max(count, 100));
            DefaultDatasetRadio.IsChecked = true;

            StatusText.Text = $"Generated a new random ATM dataset — {_activeDataset.Count} records.";
            SimulationLogListBox.Items.Clear();
            SimulationLogListBox.Items.Add($"[Info] Generated {_activeDataset.Count} new random customer records (in memory).");
            SimulationLogListBox.Items.Add("[Info] Click Run Simulation to simulate against this new dataset.");
        }

        private void ResetButton_Click(object sender, RoutedEventArgs e)
        {
            ArrivalRateTextBox.Text = "0.40";
            ServiceRateTextBox.Text = "0.55";
            ArrivalStdDevTextBox.Text = "0.50";
            ServiceStdDevTextBox.Text = "0.50";
            ServersTextBox.Text = "1";
            CustomersTextBox.Text = "120";
            SimTimeTextBox.Text = "480";
            ModelComboBox.SelectedIndex = 0;
            DefaultDatasetRadio.IsChecked = true;

            AvgWaitingTimeText.Text = "—";
            AvgServiceTimeText.Text = "—";
            AvgTurnaroundTimeText.Text = "—";
            AvgQueueLengthText.Text = "—";
            MaxQueueLengthText.Text = "—";
            UtilizationText.Text = "—";
            IdleTimeText.Text = "—";
            ProbWaitingText.Text = "—";
            ThroughputText.Text = "—";
            CustomersServedText.Text = "—";
            TotalSimTimeText.Text = "—";
            ActiveModelText.Text = "—";

            QueueLengthChartHost.Child = null;
            WaitingTimeHistogramHost.Child = null;
            UtilizationChartHost.Child = null;
            TurnaroundChartHost.Child = null;
            GanttChartHost.Child = null;
            ComparisonChartHost.Child = null;
            ComparisonDataGrid.ItemsSource = null;

            _lastResult = null;
            _lastComparisonResults = null;

            LoadDefaultDatasetIntoApp();
            StatusText.Text = "Reset complete.";
        }

        // ================= HELPERS =================

        private static double ParseDouble(string text, double fallback) =>
            double.TryParse(text, NumberStyles.Float, CultureInfo.InvariantCulture, out var value) && value > 0
                ? value
                : fallback;

        private static int ParseInt(string text, int fallback) =>
            int.TryParse(text, NumberStyles.Integer, CultureInfo.InvariantCulture, out var value) && value > 0
                ? value
                : fallback;
    }
}
