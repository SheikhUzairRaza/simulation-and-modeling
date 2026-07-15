using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Shapes;
using ATMQueueSimulationApp.Simulation;

namespace ATMQueueSimulationApp.Charts
{
    /// <summary>
    /// Draws a Gantt-style chart of ATM server activity: one horizontal row per server,
    /// one colored block per customer served, positioned and sized by real start/end time.
    /// Built with plain WPF shapes on a Canvas since Gantt charts are not a built-in
    /// LiveCharts2 series type.
    /// </summary>
    public static class GanttChartBuilder
    {
        private const double PixelsPerMinute = 6.0;
        private const double RowHeight = 34.0;
        private const double LeftMargin = 90.0;
        private const double TopMargin = 30.0;
        private const int MaxBlocksShown = 60; // keep the chart readable

        private static readonly Color[] Palette =
        {
            Color.FromRgb(0x2E, 0x86, 0xAB), Color.FromRgb(0x2E, 0x9E, 0x5B),
            Color.FromRgb(0xE6, 0x7E, 0x22), Color.FromRgb(0x8E, 0x44, 0xAD),
            Color.FromRgb(0xC0, 0x39, 0x2B), Color.FromRgb(0x16, 0xA0, 0x85)
        };

        public static UIElement Build(SimulationResult result)
        {
            if (result.ServerIntervals.Count == 0)
                return new TextBlock { Text = "No data to display yet - run a simulation first.", Margin = new Thickness(12) };

            var intervals = result.ServerIntervals.OrderBy(i => i.Start).Take(MaxBlocksShown).ToList();

            double maxTime = intervals.Max(i => i.End);
            double canvasWidth = Math.Max(600, LeftMargin + (maxTime * PixelsPerMinute) + 40);
            double canvasHeight = Math.Max(160, TopMargin + (result.NumServers * RowHeight) + 20);

            var canvas = new Canvas
            {
                Width = canvasWidth,
                Height = canvasHeight,
                Background = Brushes.White
            };

            DrawServerRows(canvas, result.NumServers, canvasWidth);
            DrawTimeAxis(canvas, maxTime, canvasHeight);
            DrawCustomerBlocks(canvas, intervals);

            var note = new TextBlock
            {
                Text = intervals.Count < result.ServerIntervals.Count
                    ? $"Showing first {intervals.Count} of {result.ServerIntervals.Count} customers served."
                    : $"Showing all {intervals.Count} customers served.",
                FontSize = 10,
                Foreground = Brushes.Gray,
                Margin = new Thickness(4)
            };

            var panel = new StackPanel();
            panel.Children.Add(note);
            panel.Children.Add(canvas);

            return new ScrollViewer
            {
                HorizontalScrollBarVisibility = ScrollBarVisibility.Auto,
                VerticalScrollBarVisibility = ScrollBarVisibility.Auto,
                Content = panel
            };
        }

        private static void DrawServerRows(Canvas canvas, int numServers, double canvasWidth)
        {
            for (int s = 0; s < numServers; s++)
            {
                double y = TopMargin + (s * RowHeight);

                var label = new TextBlock
                {
                    Text = $"Server {s + 1}",
                    FontSize = 12,
                    FontWeight = FontWeights.SemiBold,
                    Foreground = Brushes.DimGray
                };
                Canvas.SetLeft(label, 4);
                Canvas.SetTop(label, y + (RowHeight / 2) - 8);
                canvas.Children.Add(label);

                var separator = new Line
                {
                    X1 = LeftMargin,
                    Y1 = y + RowHeight,
                    X2 = canvasWidth,
                    Y2 = y + RowHeight,
                    Stroke = Brushes.Gainsboro,
                    StrokeThickness = 1
                };
                canvas.Children.Add(separator);
            }
        }

        private static void DrawTimeAxis(Canvas canvas, double maxTime, double canvasHeight)
        {
            for (double t = 0; t <= maxTime; t += 30)
            {
                double x = LeftMargin + (t * PixelsPerMinute);

                var tickLabel = new TextBlock { Text = $"{t:0}m", FontSize = 10, Foreground = Brushes.Gray };
                Canvas.SetLeft(tickLabel, x);
                Canvas.SetTop(tickLabel, 8);
                canvas.Children.Add(tickLabel);

                var gridLine = new Line
                {
                    X1 = x, Y1 = TopMargin,
                    X2 = x, Y2 = canvasHeight - 10,
                    Stroke = Brushes.WhiteSmoke,
                    StrokeThickness = 1
                };
                canvas.Children.Add(gridLine);
            }
        }

        private static void DrawCustomerBlocks(Canvas canvas, List<ServerInterval> intervals)
        {
            foreach (var interval in intervals)
            {
                double y = TopMargin + (interval.ServerIndex * RowHeight) + 4;
                double x = LeftMargin + (interval.Start * PixelsPerMinute);
                double width = Math.Max(2, (interval.End - interval.Start) * PixelsPerMinute);

                var color = Palette[interval.CustomerId % Palette.Length];
                var block = new Rectangle
                {
                    Width = width,
                    Height = RowHeight - 8,
                    Fill = new SolidColorBrush(color),
                    Stroke = Brushes.White,
                    StrokeThickness = 1,
                    RadiusX = 3,
                    RadiusY = 3,
                    ToolTip = $"Customer #{interval.CustomerId} ({interval.TransactionType})\n" +
                              $"{interval.Start:0.0} - {interval.End:0.0} min"
                };
                Canvas.SetLeft(block, x);
                Canvas.SetTop(block, y);
                canvas.Children.Add(block);

                if (width > 22)
                {
                    var idLabel = new TextBlock
                    {
                        Text = $"#{interval.CustomerId}",
                        FontSize = 9,
                        Foreground = Brushes.White,
                        IsHitTestVisible = false
                    };
                    Canvas.SetLeft(idLabel, x + 3);
                    Canvas.SetTop(idLabel, y + 3);
                    canvas.Children.Add(idLabel);
                }
            }
        }
    }
}
