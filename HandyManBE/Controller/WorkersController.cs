using BussinessObject;
using HandyManBE.DTOs;
using HandyManBE.Services;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Validate;

namespace HandyManBE.Controller
{
    [ApiController]
    [Route("api/workers")]
    public class WorkersController : ControllerBase
    {
        private readonly IWorkerService _workerService;

        public WorkersController(IWorkerService workerService)
        {
            _workerService = workerService;
        }

        [HttpGet]
        public async Task<ActionResult<List<WorkerDto>>> GetAll()
        {
            var workers = await _workerService.GetAllAsync();
            return Ok(workers.Select(DtoMapper.ToDto).ToList());
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<WorkerDto>> GetById(int id)
        {
            var worker = await _workerService.GetByIdAsync(id);
            if (worker == null)
            {
                return NotFound();
            }

            return Ok(DtoMapper.ToDto(worker));
        }

        [HttpPost]
        public async Task<ActionResult<WorkerDto>> Create(WorkerCreateUpdateDto worker)
        {
            try
            {
                var created = await _workerService.CreateAsync(DtoMapper.ToEntity(worker));
                return CreatedAtAction(nameof(GetById), new { id = created.WorkerId }, DtoMapper.ToDto(created));
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { errors = ex.Errors });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, WorkerCreateUpdateDto worker)
        {
            try
            {
                var updated = await _workerService.UpdateAsync(id, DtoMapper.ToEntity(worker, id));
                if (!updated)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { errors = ex.Errors });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _workerService.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}
