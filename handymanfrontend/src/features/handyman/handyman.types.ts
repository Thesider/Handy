export type Address = {
  addressId?: number;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
};

export type Worker = {
  workerId: number;
  yearsOfExperience: number;
  isAvailable: boolean;
  hourlyRate: number;
  rating: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: Address;
  workerProfileId?: number | null;
};

export type Service = {
  serviceId: number;
  totalJobs: number;
  serviceName: string;
  serviceFee: number;
};
