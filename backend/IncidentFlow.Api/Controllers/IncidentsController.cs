using IncidentFlow.Api.Contracts.Incidents;
using IncidentFlow.Api.Domain.Entities;
using IncidentFlow.Api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IncidentFlow.Api.Controllers;

[ApiController]
[Route("api/incidents")]
public class IncidentsController(IncidentFlowDbContext dbContext) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<IncidentResponse>> Create(
        CreateIncidentRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var incident = new Incident(
                request.Title,
                request.Description,
                request.Priority,
                request.Category);

            dbContext.Incidents.Add(incident);
            await dbContext.SaveChangesAsync(cancellationToken);

            var response = ToResponse(incident);

            return CreatedAtAction(
                nameof(GetById),
                new { id = incident.Id },
                response);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { error = exception.Message });
        }
    }

    [HttpGet]
    public async Task<ActionResult<IncidentResponse[]>> GetAll(
        CancellationToken cancellationToken)
    {
        var incidents = await dbContext.Incidents
            .AsNoTracking()
            .OrderByDescending(incident => incident.CreatedAt)
            .ToListAsync(cancellationToken);

        return Ok(incidents.Select(ToResponse).ToArray());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<IncidentResponse>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var incident = await dbContext.Incidents
            .AsNoTracking()
            .FirstOrDefaultAsync(incident => incident.Id == id, cancellationToken);

        return incident is null
            ? NotFound()
            : Ok(ToResponse(incident));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<IncidentResponse>> Update(
        Guid id,
        UpdateIncidentRequest request,
        CancellationToken cancellationToken)
    {
        var incident = await dbContext.Incidents
            .FirstOrDefaultAsync(incident => incident.Id == id, cancellationToken);

        if (incident is null)
        {
            return NotFound();
        }

        try
        {
            incident.Update(
                request.Title,
                request.Description,
                request.Priority,
                request.Category);

            await dbContext.SaveChangesAsync(cancellationToken);

            return Ok(ToResponse(incident));
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { error = exception.Message });
        }
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<IncidentResponse>> ChangeStatus(
        Guid id,
        ChangeIncidentStatusRequest request,
        CancellationToken cancellationToken)
    {
        var incident = await dbContext.Incidents
            .FirstOrDefaultAsync(incident => incident.Id == id, cancellationToken);

        if (incident is null)
        {
            return NotFound();
        }

        try
        {
            incident.ChangeStatus(request.Status);
            await dbContext.SaveChangesAsync(cancellationToken);

            return Ok(ToResponse(incident));
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { error = exception.Message });
        }
    }

    private static IncidentResponse ToResponse(Incident incident) => new(
        incident.Id,
        incident.Title,
        incident.Description,
        incident.Priority,
        incident.Status,
        incident.Category,
        incident.CreatedAt,
        incident.UpdatedAt,
        incident.ResolvedAt);
}
