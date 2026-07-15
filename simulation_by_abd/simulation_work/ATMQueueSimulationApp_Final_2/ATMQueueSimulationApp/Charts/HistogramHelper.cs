using System.Collections.Generic;
using System.Linq;

namespace ATMQueueSimulationApp.Charts
{
    /// <summary>
    /// Turns a raw list of numbers (waiting times, turnaround times, ...) into evenly-spaced
    /// bins with counts, ready to feed straight into a bar/column chart. Used by both the
    /// Waiting Time Histogram and the Turnaround Time Distribution charts, so the binning
    /// logic only needs to be written once.
    /// </summary>
    public static class HistogramHelper
    {
        public record Bin(string Label, int Count);

        public static List<Bin> BuildBins(IEnumerable<double> values, int binCount = 8)
        {
            var data = values.ToList();
            if (data.Count == 0)
                return new List<Bin> { new("No data", 0) };

            double min = data.Min();
            double max = data.Max();
            if (max - min < 0.01) max = min + 1.0; // avoid a zero-width single bin

            double width = (max - min) / binCount;
            var counts = new int[binCount];

            foreach (var value in data)
            {
                int index = (int)((value - min) / width);
                if (index >= binCount) index = binCount - 1;
                if (index < 0) index = 0;
                counts[index]++;
            }

            var bins = new List<Bin>();
            for (int i = 0; i < binCount; i++)
            {
                double lo = min + (i * width);
                double hi = lo + width;
                bins.Add(new Bin($"{lo:0.0}-{hi:0.0}", counts[i]));
            }

            return bins;
        }
    }
}
