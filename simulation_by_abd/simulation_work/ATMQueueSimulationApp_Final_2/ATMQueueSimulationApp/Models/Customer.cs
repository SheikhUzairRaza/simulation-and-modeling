namespace ATMQueueSimulationApp.Models
{
    /// <summary>
    /// Represents a single ATM customer, either loaded from the default HBL dataset
    /// or generated on the fly for a custom simulation run.
    /// </summary>
    public class Customer
    {
        public int CustomerId { get; set; }

        /// <summary>Clock time (in minutes from opening) at which the customer arrives.</summary>
        public double ArrivalTime { get; set; }

        /// <summary>Time since the previous customer's arrival (minutes).</summary>
        public double InterarrivalTime { get; set; }

        /// <summary>Time required at the ATM to complete the transaction (minutes).</summary>
        public double ServiceTime { get; set; }

        /// <summary>Withdrawal, Balance Inquiry, Fund Transfer, Mini Statement, Deposit.</summary>
        public string TransactionType { get; set; } = "Withdrawal";

        // ---- Fields populated during simulation (not part of the raw dataset) ----

        /// <summary>Time the customer actually starts being served (after any wait).</summary>
        public double ServiceStartTime { get; set; }

        /// <summary>Time the customer finishes and leaves the ATM.</summary>
        public double ServiceEndTime { get; set; }

        /// <summary>Which server (ATM terminal index) served this customer.</summary>
        public int ServerIndex { get; set; }

        public double WaitingTime => ServiceStartTime - ArrivalTime;

        public double TurnaroundTime => ServiceEndTime - ArrivalTime;
    }
}
