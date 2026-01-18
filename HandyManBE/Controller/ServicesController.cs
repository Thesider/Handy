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
    [Route("api/services")]
    public class ServicesController : ControllerBase
    {
        private readonly IServiceAppService _serviceAppService;

        public ServicesController(IServiceAppService serviceAppService)
        {
            _serviceAppService = serviceAppService;
        }

        [HttpGet]
        public async Task<ActionResult<List<ServiceDto>>> GetAll()
        {
            var services = await _serviceAppService.GetAllAsync();
            return Ok(services.Select(DtoMapper.ToDto).ToList());
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ServiceDto>> GetById(int id)
        {
            var service = await _serviceAppService.GetByIdAsync(id);
            if (service == null)
            {
                return NotFound();
            }

            return Ok(DtoMapper.ToDto(service));
        }

        [HttpPost]
        public async Task<ActionResult<ServiceDto>> Create(ServiceCreateUpdateDto service)
        {
            try
            {
                var created = await _serviceAppService.CreateAsync(DtoMapper.ToEntity(service));
                return CreatedAtAction(nameof(GetById), new { id = created.ServiceId }, DtoMapper.ToDto(created));
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { errors = ex.Errors });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, ServiceCreateUpdateDto service)
        {
            try
            {
                var updated = await _serviceAppService.UpdateAsync(id, DtoMapper.ToEntity(service, id));
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
            var deleted = await _serviceAppService.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}
