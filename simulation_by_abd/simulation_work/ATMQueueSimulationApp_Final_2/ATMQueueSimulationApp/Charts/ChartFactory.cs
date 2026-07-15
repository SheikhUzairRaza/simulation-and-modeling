using System;
using System.Collections.Generic;
using System.Linq;
using ATMQueueSimulationApp.Simulation;
using LiveChartsCore;
using LiveChartsCore.Defaults;
using LiveChartsCore.SkiaSharpView;
using LiveChartsCore.SkiaSharpView.Painting;
using LiveChartsCore.SkiaSharpView.WPF;
using SkiaSharp;

namespace ATMQueueSimulationApp.Charts
{
    /// <summary>
    /// Builds all the LiveCharts2 chart controls used on the dashboard's right-hand panel
    /// and the comparison screen. Every method here takes a SimulationResult (or a list of
    /// them) and returns a ready-to-display chart - the same factory is reused for every one
    /// of the 6 queueing models, since a SimulationResult always has the same shape.
    /// </summary>
    public static class ChartFactory
    {
        private static readonly SKColor PrimaryColor = new(0x2E, 0x86, 0xAB);
        private static readonly SKColor AccentColor = new(0x1F, 0x3A, 0x5F);
        private static readonly SKColor GrayColor = new(0x6B, 0x72, 0x80);
        private static readonly SKColor SuccessColor = new(0x2E, 0x9E, 0x5B);

        /// <summary>Queue Length vs Time - a line chart of how many customers were waiting at each moment.</summary>
        public static CartesianChart BuildQueueLengthChart(SimulationResult result)
        {
            var points = result.QueueTimeline
                .Select(q => new ObservablePoint(q.Time, q.QueueLength))
                .ToArray();

            return new CartesianChart
            {
                Series = new ISeries[]
                {
                    new LineSeries<ObservablePoint>
                    {
                        Values = points,
                        Fill = null,
                        GeometryFill = null,
                        GeometryStroke = null,
                        LineSmoothness = 0,
                        Stroke = new SolidColorPaint(PrimaryColor, 2)
                    }
                },
                XAxes = new[] { new Axis { Name = "Time (minutes)", NamePaint = new SolidColorPaint(GrayColor) } },
                YAxes = new[] { new Axis { Name = "Customers waiting", NamePaint = new SolidColorPaint(GrayColor), MinLimit = 0 } }
            };
        }

        /// <summary>Waiting Time Histogram - how many customers waited within each time bracket.</summary>
        public static CartesianChart BuildWaitingTimeHistogram(SimulationResult result)
        {
            var bins = HistogramHelper.BuildBins(result.Customers.Select(c => c.WaitingTime));
            return BuildHistogramChart(bins, "Waiting time (min)");
        }

        /// <summary>Turnaround Time Distribution - how many customers had each total time-in-system bracket.</summary>
        public static CartesianChart BuildTurnaroundDistributionChart(SimulationResult result)
        {
            var bins = HistogramHelper.BuildBins(result.Customers.Select(c => c.TurnaroundTime));
            return BuildHistogramChart(bins, "Turnaround time (min)");
        }

        /// <summary>Shared bar-chart builder used by both histograms above (no need to duplicate this).</summary>
        private static CartesianChart BuildHistogramChart(List<HistogramHelper.Bin> bins, string xAxisTitle)
        {
            return new CartesianChart
            {
                Series = new ISeries[]
                {
                    new ColumnSeries<int>
                    {
                        Values = bins.Select(b => b.Count).ToArray(),
                        Fill = new SolidColorPaint(AccentColor),
                        MaxBarWidth = 42
                    }
                },
                XAxes = new[]
                {
                    new Axis
                    {
                        Labels = bins.Select(b => b.Label).ToArray(),
                        Name = xAxisTitle,
                        NamePaint = new SolidColorPaint(GrayColor),
                        LabelsRotation = 30
                    }
                },
                YAxes = new[] { new Axis { Name = "Customers", NamePaint = new SolidColorPaint(GrayColor), MinLimit = 0 } }
            };
        }

        /// <summary>Server Utilization - percentage of the simulation each individual server (ATM terminal) was busy.</summary>
        public static CartesianChart BuildUtilizationChart(SimulationResult result)
        {
            var busyPerServer = new double[result.NumServers];
            foreach (var interval in result.ServerIntervals)
                busyPerServer[interval.ServerIndex] += interval.End - interval.Start;

            var utilizationPercent = busyPerServer
                .Select(busy => result.TotalSimulationTime > 0
                    ? Math.Min(100.0, (busy / result.TotalSimulationTime) * 100.0)
                    : 0.0)
                .ToArray();

            var labels = Enumerable.Range(1, result.NumServers).Select(i => $"Server {i}").ToArray();

            return new CartesianChart
            {
                Series = new ISeries[]
                {
                    new ColumnSeries<double>
                    {
                        Values = utilizationPercent,
                        Fill = new SolidColorPaint(PrimaryColor),
                        MaxBarWidth = 55
                    }
                },
                XAxes = new[] { new Axis { Labels = labels, NamePaint = new SolidColorPaint(GrayColor) } },
                YAxes = new[]
                {
                    new Axis
                    {
                        Name = "Utilization %",
                        NamePaint = new SolidColorPaint(GrayColor),
                        MinLimit = 0,
                        MaxLimit = 100
                    }
                }
            };
        }

        /// <summary>
        /// Model Comparison chart - average waiting time side-by-side for all 6 models,
        /// used by the "Compare All Models" feature.
        /// </summary>
        public static CartesianChart BuildComparisonChart(List<SimulationResult> results)
        {
            var values = results.Select(r => r.AvgWaitingTime).ToArray();
            var labels = results.Select(r => r.ModelName).ToArray();

            return new CartesianChart
            {
                Series = new ISeries[]
                {
                    new ColumnSeries<double>
                    {
                        Values = values,
                        Fill = new SolidColorPaint(SuccessColor),
                        MaxBarWidth = 50,
                        Name = "Avg Waiting Time (min)"
                    }
                },
                XAxes = new[] { new Axis { Labels = labels, NamePaint = new SolidColorPaint(GrayColor) } },
                YAxes = new[]
                {
                    new Axis { Name = "Avg Waiting Time (min)", NamePaint = new SolidColorPaint(GrayColor), MinLimit = 0 }
                }
            };
        }
    }
}
