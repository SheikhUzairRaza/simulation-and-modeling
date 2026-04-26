using Microsoft.AspNetCore.Mvc;
using QueueSimulatorAPI.Models;
using QueueSimulatorAPI.Services;

namespace QueueSimulatorAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SimulationController : ControllerBase
{
    private readonly MM1Service _mm1Service;
    private readonly MG1Service _mg1Service;
    private readonly GG1Service _gg1Service;
    private readonly MMSService _mmsService;
    private readonly MGSService _mgsService;
    private readonly GGSService _ggsService;

    public SimulationController(
        MM1Service mm1Service,
        MG1Service mg1Service,
        GG1Service gg1Service,
        MMSService mmsService,
        MGSService mgsService,
        GGSService ggsService)
    {
        _mm1Service = mm1Service;
        _mg1Service = mg1Service;
        _gg1Service = gg1Service;
        _mmsService = mmsService;
        _mgsService = mgsService;
        _ggsService = ggsService;
    }

    [HttpPost("mm1")]
    [ProducesResponseType(typeof(MM1Response), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult CalculateMM1([FromBody] MM1Request request)
    {
        try
        {
            return RunCalculation(() => _mm1Service.Calculate(
                request.MeanInterarrivalTime,
                request.MeanServiceTime));
        }
        catch (Exception ex)
        {
            return HandleCalculationException(ex);
        }
    }

    [HttpPost("mg1")]
    [ProducesResponseType(typeof(MM1Response), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult CalculateMG1([FromBody] MG1Request request)
    {
        try
        {
            return RunCalculation(() => _mg1Service.Calculate(
                request.MeanInterarrivalTime,
                request.MeanServiceTime,
                request.ServiceTimeStandardDeviation));
        }
        catch (Exception ex)
        {
            return HandleCalculationException(ex);
        }
    }

    [HttpPost("gg1")]
    [ProducesResponseType(typeof(MM1Response), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult CalculateGG1([FromBody] GG1Request request)
    {
        try
        {
            return RunCalculation(() => _gg1Service.Calculate(
                request.MeanInterarrivalTime,
                request.MeanServiceTime,
                request.InterarrivalTimeStandardDeviation,
                request.ServiceTimeStandardDeviation));
        }
        catch (Exception ex)
        {
            return HandleCalculationException(ex);
        }
    }

    [HttpPost("mms")]
    [ProducesResponseType(typeof(MM1Response), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult CalculateMMS([FromBody] MMSRequest request)
    {
        try
        {
            return RunCalculation(() => _mmsService.Calculate(
                request.MeanInterarrivalTime,
                request.MeanServiceTime,
                request.NumberOfServers));
        }
        catch (Exception ex)
        {
            return HandleCalculationException(ex);
        }
    }

    [HttpPost("mgs")]
    [ProducesResponseType(typeof(MM1Response), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult CalculateMGS([FromBody] MGSRequest request)
    {
        try
        {
            return RunCalculation(() => _mgsService.Calculate(
                request.MeanInterarrivalTime,
                request.MeanServiceTime,
                request.ServiceTimeStandardDeviation,
                request.NumberOfServers));
        }
        catch (Exception ex)
        {
            return HandleCalculationException(ex);
        }
    }

    [HttpPost("ggs")]
    [ProducesResponseType(typeof(MM1Response), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult CalculateGGS([FromBody] GGSRequest request)
    {
        try
        {
            return RunCalculation(() => _ggsService.Calculate(
                request.MeanInterarrivalTime,
                request.MeanServiceTime,
                request.InterarrivalTimeStandardDeviation,
                request.ServiceTimeStandardDeviation,
                request.NumberOfServers));
        }
        catch (Exception ex)
        {
            return HandleCalculationException(ex);
        }
    }

    private IActionResult RunCalculation(Func<MM1Response> calculator)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        return Ok(calculator());
    }

    private IActionResult HandleCalculationException(Exception ex)
    {
        return ex switch
        {
            InvalidOperationException => BadRequest(new { error = ex.Message }),
            ArgumentException => BadRequest(new { error = ex.Message }),
            _ => StatusCode(500, new { error = "An unexpected error occurred", details = ex.Message })
        };
    }
}
