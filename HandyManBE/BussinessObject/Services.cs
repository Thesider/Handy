namespace BussinessObject;

public class Service
{
    public int ServiceId { get; set; }
    public int TotalJobs { get; set; }
    public string ServiceName { get; set; }
    public decimal ServiceFee { get; set; }
    public decimal MinPrice { get; set; }
    public decimal MaxPrice { get; set; }

    public virtual ICollection<WorkerService> WorkerServices { get; set; } = new List<WorkerService>();

}