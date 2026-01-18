export type Customer = {
  customerId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password?: string;
};

export type AdminUser = {
  adminId: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
};

export type AdminUpdatePayload = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
};
