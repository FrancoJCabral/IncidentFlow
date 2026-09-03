using IncidentFlow.Api.Infrastructure.ErrorHandling;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace IncidentFlow.Api.Tests;

public class GlobalExceptionHandlerTests
{
    [Fact]
    public async Task ArgumentException_ReturnsInvalidRequestProblemDetails()
    {
        var problemDetailsService = new CapturingProblemDetailsService();
        var handler = new GlobalExceptionHandler(
            problemDetailsService,
            NullLogger<GlobalExceptionHandler>.Instance);
        var httpContext = new DefaultHttpContext();

        var handled = await handler.TryHandleAsync(
            httpContext,
            new ArgumentException("Title is required."),
            CancellationToken.None);

        Assert.True(handled);
        Assert.Equal(StatusCodes.Status400BadRequest, httpContext.Response.StatusCode);
        Assert.NotNull(problemDetailsService.ProblemDetails);
        Assert.Equal("about:blank", problemDetailsService.ProblemDetails.Type);
        Assert.Equal("Invalid request", problemDetailsService.ProblemDetails.Title);
        Assert.Equal(StatusCodes.Status400BadRequest, problemDetailsService.ProblemDetails.Status);
        Assert.Equal("Title is required.", problemDetailsService.ProblemDetails.Detail);
    }

    private sealed class CapturingProblemDetailsService : IProblemDetailsService
    {
        public ProblemDetails? ProblemDetails { get; private set; }

        public ValueTask<bool> TryWriteAsync(ProblemDetailsContext context)
        {
            ProblemDetails = context.ProblemDetails;
            return ValueTask.FromResult(true);
        }

        public ValueTask WriteAsync(ProblemDetailsContext context)
        {
            ProblemDetails = context.ProblemDetails;
            return ValueTask.CompletedTask;
        }
    }
}
