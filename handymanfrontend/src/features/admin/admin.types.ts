export type Customer = {
  customerId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password?: string;
};

export type ModerationVerificationStatus =
  | "Unverified"
  | "Pending"
  | "Verified"
  | "Rejected";

export type ModerationRole = "Worker" | "Customer";

export type ModerationUser = {
  role: ModerationRole;
  id: number;
  name: string;
  email: string;
  isBlocked: boolean;
  isApprovedByAdmin: boolean;
  requiresAdminPreApproval: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  idVerificationStatus: ModerationVerificationStatus;
};

export type ModerationUsersResponse = {
  workers: ModerationUser[];
  customers: ModerationUser[];
};

export type AdminUserModerationUpdatePayload = {
  isBlocked: boolean;
  isApprovedByAdmin: boolean;
  idVerificationStatus: ModerationVerificationStatus;
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
