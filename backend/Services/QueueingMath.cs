using QueueSimulatorAPI.Models;

namespace QueueSimulatorAPI.Services;

internal static class QueueingMath
{
    public static MM1Response CalculateMM1(double meanInterarrivalTime, double meanServiceTime)
    {
        ValidateBasicInputs(meanInterarrivalTime, meanServiceTime, 1);

        double lambda = 1.0 / meanInterarrivalTime;
        double mu = 1.0 / meanServiceTime;
        double rho = lambda / mu;

        if (rho >= 1.0)
            throw new InvalidOperationException("System unstable. Utilization (rho) must be less than 1.");

        double lq = (rho * rho) / (1.0 - rho);
        double wq = lq / lambda;
        double w = wq + (1.0 / mu);
        double l = lambda * w;
        double idleProbability = 1.0 - rho;

        return new MM1Response
        {
            Lambda = lambda,
            Mu = mu,
            Rho = rho,
            Lq = lq,
            Wq = wq,
            W = w,
            L = l,
            IdleProbability = idleProbability
        };
    }

    public static MM1Response CalculateMMs(double meanInterarrivalTime, double meanServiceTime, int numberOfServers)
    {
        ValidateBasicInputs(meanInterarrivalTime, meanServiceTime, numberOfServers);

        double lambda = 1.0 / meanInterarrivalTime;
        double mu = 1.0 / meanServiceTime;
        double trafficIntensity = lambda / mu;
        double rho = lambda / (numberOfServers * mu);

        if (rho >= 1.0)
            throw new InvalidOperationException("System unstable rho must be < 1");

        double p0Denominator = 0.0;
        for (int n = 0; n < numberOfServers; n++)
        {
            p0Denominator += Math.Pow(trafficIntensity, n) / Factorial(n);
        }

        double tailTerm = Math.Pow(trafficIntensity, numberOfServers) /
            (Factorial(numberOfServers) * (1.0 - rho));
        double p0 = 1.0 / (p0Denominator + tailTerm);
        double probabilityOfWait = tailTerm * p0;
        double lq = probabilityOfWait * (rho / (1.0 - rho));
        double wq = lq / lambda;
        double w = wq + meanServiceTime;
        double l = lambda * w;

        return new MM1Response
        {
            Lambda = lambda,
            Mu = mu,
            Rho = rho,
            Lq = lq,
            Wq = wq,
            W = w,
            L = l,
            IdleProbability = p0
        };
    }

    public static MM1Response CalculateMG1(double meanInterarrivalTime, double meanServiceTime, double serviceTimeStandardDeviation)
    {
        ValidateBasicInputs(meanInterarrivalTime, meanServiceTime, 1);
        if (serviceTimeStandardDeviation < 0)
            throw new ArgumentException("Service Time Standard Deviation cannot be negative");

        double lambda = 1.0 / meanInterarrivalTime;
        double mu = 1.0 / meanServiceTime;
        double rho = lambda / mu;

        if (rho >= 1.0)
            throw new InvalidOperationException("System unstable. Utilization (rho) must be less than 1.");

        double variance = serviceTimeStandardDeviation * serviceTimeStandardDeviation;
        double lq = ((lambda * lambda) * variance + (rho * rho)) / (2.0 * (1.0 - rho));
        double wq = lq / lambda;
        double w = wq + (1.0 / mu);
        double l = lambda * w;

        return new MM1Response
        {
            Lambda = lambda,
            Mu = mu,
            Rho = rho,
            Lq = lq,
            Wq = wq,
            W = w,
            L = l,
            IdleProbability = Math.Max(0.0, 1.0 - rho)
        };
    }

    public static MM1Response CalculateGG1(
        double meanInterarrivalTime,
        double meanServiceTime,
        double interarrivalTimeStandardDeviation,
        double serviceTimeStandardDeviation)
    {
        ValidateBasicInputs(meanInterarrivalTime, meanServiceTime, 1);

        if (interarrivalTimeStandardDeviation < 0)
            throw new ArgumentException("Interarrival Time Standard Deviation cannot be negative");

        if (serviceTimeStandardDeviation < 0)
            throw new ArgumentException("Service Time Standard Deviation cannot be negative");

        double lambda = 1.0 / meanInterarrivalTime;
        double mu = 1.0 / meanServiceTime;
        double rho = lambda / mu;

        if (rho >= 1.0)
            throw new InvalidOperationException("System unstable. Utilization (rho) must be less than 1.");

        double ca = interarrivalTimeStandardDeviation / meanInterarrivalTime;
        double cs = serviceTimeStandardDeviation / meanServiceTime;
        double caSquared = ca * ca;
        double csSquared = cs * cs;

        double denominator = 2.0 * (1.0 - rho) * (1.0 + (rho * rho * csSquared));
        if (denominator <= 0.0)
            throw new InvalidOperationException("Invalid denominator while computing G/G/1 metrics.");

        double lq =
            ((rho * rho) * (caSquared + csSquared) * (caSquared + (rho * rho * csSquared))) /
            denominator;

        if (double.IsNaN(lq) || double.IsInfinity(lq))
            throw new InvalidOperationException("Failed to compute finite G/G/1 queue length.");

        lq = Math.Max(0.0, lq);
        double wq = Math.Max(0.0, lq / lambda);
        double w = wq + (1.0 / mu);
        double l = lambda * w;

        return new MM1Response
        {
            Lambda = lambda,
            Mu = mu,
            Rho = rho,
            Lq = lq,
            Wq = wq,
            W = w,
            L = l,
            IdleProbability = Math.Max(0.0, 1.0 - rho)
        };
    }

    public static MM1Response CalculateMGS(
        double meanInterarrivalTime,
        double meanServiceTime,
        double serviceTimeStandardDeviation,
        int numberOfServers)
    {
        if (numberOfServers <= 0)
            throw new ArgumentException("Number Of Servers must be > 0");

        if (numberOfServers == 1)
            return CalculateMG1(meanInterarrivalTime, meanServiceTime, serviceTimeStandardDeviation);

        ValidateBasicInputs(meanInterarrivalTime, meanServiceTime, numberOfServers);
        if (serviceTimeStandardDeviation < 0)
            throw new ArgumentException("Service Time Standard Deviation cannot be negative");

        double lambda = 1.0 / meanInterarrivalTime;
        double mu = 1.0 / meanServiceTime;
        double rho = lambda / (numberOfServers * mu);

        if (rho >= 1.0)
            throw new InvalidOperationException("System unstable. Utilization (rho) must be less than 1.");

        double caSquared = 1.0;
        double cs = serviceTimeStandardDeviation / meanServiceTime;
        double csSquared = cs * cs;
        double erlangC = CalculateErlangC(lambda, mu, numberOfServers);
        double variabilityFactor = (caSquared + csSquared) / 2.0;
        double wq = variabilityFactor * (erlangC / (numberOfServers * mu - lambda));
        double w = wq + (1.0 / mu);
        double lq = lambda * wq;
        double l = lambda * w;

        return new MM1Response
        {
            Lambda = lambda,
            Mu = mu,
            Rho = rho,
            Lq = lq,
            Wq = wq,
            W = w,
            L = l,
            IdleProbability = CalculateMMs(meanInterarrivalTime, meanServiceTime, numberOfServers).IdleProbability
        };
    }

    public static MM1Response CalculateGGS(
        double meanInterarrivalTime,
        double meanServiceTime,
        double interarrivalTimeStandardDeviation,
        double serviceTimeStandardDeviation,
        int numberOfServers)
    {
        if (numberOfServers <= 0)
            throw new ArgumentException("Number Of Servers must be > 0");

        if (numberOfServers == 1)
            return CalculateGG1(
                meanInterarrivalTime,
                meanServiceTime,
                interarrivalTimeStandardDeviation,
                serviceTimeStandardDeviation);

        ValidateBasicInputs(meanInterarrivalTime, meanServiceTime, numberOfServers);

        if (interarrivalTimeStandardDeviation < 0)
            throw new ArgumentException("Interarrival Time Standard Deviation cannot be negative");

        if (serviceTimeStandardDeviation < 0)
            throw new ArgumentException("Service Time Standard Deviation cannot be negative");

        double lambda = 1.0 / meanInterarrivalTime;
        double mu = 1.0 / meanServiceTime;
        double rho = lambda / (numberOfServers * mu);

        if (rho >= 1.0)
            throw new InvalidOperationException("System unstable. Utilization (rho) must be less than 1.");

        double ca = interarrivalTimeStandardDeviation / meanInterarrivalTime;
        double cs = serviceTimeStandardDeviation / meanServiceTime;
        double caSquared = ca * ca;
        double csSquared = cs * cs;
        double erlangC = CalculateErlangC(lambda, mu, numberOfServers);
        double variabilityFactor = (caSquared + csSquared) / 2.0;
        double wq = variabilityFactor * (erlangC / (numberOfServers * mu - lambda));
        double w = wq + (1.0 / mu);
        double lq = lambda * wq;
        double l = lambda * w;

        return new MM1Response
        {
            Lambda = lambda,
            Mu = mu,
            Rho = rho,
            Lq = lq,
            Wq = wq,
            W = w,
            L = l,
            IdleProbability = CalculateMMs(meanInterarrivalTime, meanServiceTime, numberOfServers).IdleProbability
        };
    }

    private static void ValidateBasicInputs(double meanInterarrivalTime, double meanServiceTime, int numberOfServers)
    {
        if (meanInterarrivalTime <= 0)
            throw new ArgumentException("Mean Interarrival Time must be > 0");

        if (meanServiceTime <= 0)
            throw new ArgumentException("Mean Service Time must be > 0");

        if (numberOfServers <= 0)
            throw new ArgumentException("Number Of Servers must be > 0");
    }

    private static double Factorial(int n)
    {
        double result = 1.0;
        for (int i = 2; i <= n; i++)
        {
            result *= i;
        }

        return result;
    }

    private static double CalculateErlangC(double lambda, double mu, int servers)
    {
        double a = lambda / mu;
        double rho = lambda / (servers * mu);

        double denominator = 0.0;
        for (int n = 0; n < servers; n++)
        {
            denominator += Math.Pow(a, n) / Factorial(n);
        }

        double top = Math.Pow(a, servers) / (Factorial(servers) * (1.0 - rho));
        denominator += top;

        return top / denominator;
    }
}
