export type AuthUser = {
  id?: number;
  email: string;
  name?: string;
  role?: "Customer" | "Worker" | "Admin";
};

export type AuthResponse = {
  token: string;
  user?: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type RegisterCustomerPayload = RegisterPayload & {
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

export type RegisterWorkerPayload = RegisterPayload & {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  hourlyRate: number;
  address: {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country?: string;
  };
};

export type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  registerCustomer: (payload: RegisterCustomerPayload) => Promise<void>;
  registerWorker: (payload: RegisterWorkerPayload) => Promise<void>;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
};
