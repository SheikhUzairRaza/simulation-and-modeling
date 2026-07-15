using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using ATMQueueSimulationApp.Models;
using ATMQueueSimulationApp.Simulation;

namespace ATMQueueSimulationApp.Services
{
    /// <summary>
    /// Handles everything related to getting Customer data into the app:
    /// loading the bundled default HBL ATM dataset, generating a brand-new realistic
    /// random dataset (for the "Generate Random Dataset" button), and saving either
    /// one back out to CSV.
    /// </summary>
    public static class DatasetService
    {
        private static readonly string[] TransactionTypes =
            { "Withdrawal", "Balance Inquiry", "Fund Transfer", "Mini Statement", "Deposit" };

        private static readonly double[] TransactionWeights = { 0.55, 0.15, 0.12, 0.08, 0.10 };

        // Mean service time (minutes) and coefficient of variation per transaction type,
        // reusing GeneralDistribution's Gamma sampler instead of writing new random-number code.
        private static readonly (double Mean, double Cv)[] ServiceProfile =
        {
            (1.8, 0.50),  // Withdrawal
            (0.5, 0.577), // Balance Inquiry
            (2.5, 0.447), // Fund Transfer
            (1.0, 0.535), // Mini Statement
            (2.2, 0.471), // Deposit
        };

        public static string DefaultDatasetPath =>
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Data", "atm_dataset.csv");

        /// <summary>Loads the bundled default HBL ATM dataset (Data/atm_dataset.csv).</summary>
        public static List<Customer> LoadDefaultDataset(string? path = null)
        {
            path ??= DefaultDatasetPath;

            if (!File.Exists(path))
                throw new FileNotFoundException($"Default dataset not found at '{path}'. " +
                                                 "Make sure Data/atm_dataset.csv is copied to the output folder.");

            var customers = new List<Customer>();
            var lines = File.ReadAllLines(path);

            // Header: CustomerID,ArrivalTime,ArrivalClockTime,InterarrivalTime,ServiceTime,TransactionType
            for (int i = 1; i < lines.Length; i++)
            {
                if (string.IsNullOrWhiteSpace(lines[i])) continue;
                var parts = lines[i].Split(',');
                if (parts.Length < 6) continue;

                customers.Add(new Customer
                {
                    CustomerId = int.Parse(parts[0], CultureInfo.InvariantCulture),
                    ArrivalTime = double.Parse(parts[1], CultureInfo.InvariantCulture),
                    InterarrivalTime = double.Parse(parts[3], CultureInfo.InvariantCulture),
                    ServiceTime = double.Parse(parts[4], CultureInfo.InvariantCulture),
                    TransactionType = parts[5]
                });
            }

            return customers;
        }

        /// <summary>
        /// Generates a brand-new realistic ATM dataset in memory (same statistical
        /// shape as the bundled dataset: quiet morning, lunch rush, evening pickup).
        /// Used by the "Generate Random Dataset" button.
        /// </summary>
        public static List<Customer> GenerateRandomDataset(int targetCount = 130, int? seed = null)
        {
            var rng = seed.HasValue ? new Random(seed.Value) : new Random();
            var customers = new List<Customer>();

            double clock = 0.0;
            const double totalMinutes = 480.0; // 8-hour observation window
            int id = 1;

            while (clock < totalMinutes && id <= targetCount)
            {
                double rate = ArrivalRateAt(clock);
                var interarrivalDist = new ExponentialDistribution(1.0 / rate);
                double gap = interarrivalDist.Sample(rng);
                clock += gap;
                if (clock >= totalMinutes) break;

                string txnType = SampleTransactionType(rng);
                double serviceTime = SampleServiceTime(txnType, rng);

                customers.Add(new Customer
                {
                    CustomerId = id,
                    ArrivalTime = Math.Round(clock, 2),
                    InterarrivalTime = Math.Round(gap, 2),
                    ServiceTime = Math.Round(serviceTime, 2),
                    TransactionType = txnType
                });

                id++;
            }

            return customers;
        }

        /// <summary>Saves any customer list (default or generated) to a CSV file in the same format used for loading.</summary>
        public static void SaveDatasetToCsv(List<Customer> customers, string path)
        {
            var directory = Path.GetDirectoryName(path);
            if (!string.IsNullOrEmpty(directory)) Directory.CreateDirectory(directory);

            using var writer = new StreamWriter(path, false);
            writer.WriteLine("CustomerID,ArrivalTime,ArrivalClockTime,InterarrivalTime,ServiceTime,TransactionType");

            var open = new TimeSpan(9, 0, 0); // 9:00 AM opening, purely for the readable clock column
            foreach (var c in customers)
            {
                var clockTime = open.Add(TimeSpan.FromMinutes(c.ArrivalTime));
                string clockText = DateTime.Today.Add(clockTime).ToString("hh:mm tt", CultureInfo.InvariantCulture);

                writer.WriteLine(string.Join(",",
                    c.CustomerId.ToString(CultureInfo.InvariantCulture),
                    c.ArrivalTime.ToString("0.00", CultureInfo.InvariantCulture),
                    clockText,
                    c.InterarrivalTime.ToString("0.00", CultureInfo.InvariantCulture),
                    c.ServiceTime.ToString("0.00", CultureInfo.InvariantCulture),
                    c.TransactionType));
            }
        }

        // ---- Helpers reused only within dataset generation ----

        /// <summary>Piecewise arrival rate (customers/min) mimicking a food-court ATM's daily pattern.</summary>
        private static double ArrivalRateAt(double minutesSinceOpening) => minutesSinceOpening switch
        {
            < 90 => 0.18,   // 9:00 - 10:30, slow morning
            < 180 => 0.28,  // 10:30 - 12:00, building up
            < 300 => 0.55,  // 12:00 - 14:00, lunch rush
            < 360 => 0.35,  // 14:00 - 15:00, cooling down
            < 420 => 0.30,  // 15:00 - 16:00, moderate
            _ => 0.42       // 16:00 - 17:00, evening pickup
        };

        private static string SampleTransactionType(Random rng)
        {
            double r = rng.NextDouble();
            double cumulative = 0.0;
            for (int i = 0; i < TransactionTypes.Length; i++)
            {
                cumulative += TransactionWeights[i];
                if (r <= cumulative) return TransactionTypes[i];
            }
            return TransactionTypes[^1];
        }

        private static double SampleServiceTime(string transactionType, Random rng)
        {
            int index = Array.IndexOf(TransactionTypes, transactionType);
            if (index < 0) index = 0;

            var (mean, cv) = ServiceProfile[index];
            var dist = new GeneralDistribution(mean, cv);
            return Math.Max(0.2, dist.Sample(rng));
        }
    }
}
