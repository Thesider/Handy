namespace BussinessObject
{
    public class WorkerService
    {
        public int WorkerServiceId { get; set; }
        public int WorkerId { get; set; }
        public int ServiceId { get; set; }
        public decimal? CustomHourlyRate { get; set; }
        public decimal ServiceFee { get; set; }
        public virtual Worker Worker { get; set; }
        public virtual Service Service { get; set; }
    }
}
