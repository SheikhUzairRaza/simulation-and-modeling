using QueueSimulatorAPI.Models;

namespace QueueSimulatorAPI.Services;

internal static class QueueingMath
{
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

    public static MM1Response ApplyVariabilityMultiplier(MM1Response baseResponse, double multiplier)
    {
        if (multiplier < 0)
            throw new ArgumentException("Variability multiplier cannot be negative");

        double wq = baseResponse.Wq * multiplier;
        double w = wq + (1.0 / baseResponse.Mu);
        double lq = baseResponse.Lambda * wq;
        double l = baseResponse.Lambda * w;

        return new MM1Response
        {
            Lambda = baseResponse.Lambda,
            Mu = baseResponse.Mu,
            Rho = baseResponse.Rho,
            Lq = lq,
            Wq = wq,
            W = w,
            L = l,
            IdleProbability = baseResponse.IdleProbability
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
}
