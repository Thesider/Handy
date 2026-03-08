import type {
  ModerationUser,
  ModerationUsersResponse,
} from "./admin.types";
import type { WorkerAcceptanceMetrics } from "../handyman/handyman.types";
import { METRICS_THRESHOLDS } from "../../utils/constants";

export type RiskLevel = "Low" | "Medium" | "High";

export type AdminKpiSnapshot = {
  totalUsers: number;
  totalWorkers: number;
  totalCustomers: number;
  blockedUsers: number;
  approvedUsers: number;
  pendingVerification: number;
  verifiedUsers: number;
  approvalCoveragePercent: number;
};

export type RoleDistributionDatum = {
  role: "Workers" | "Customers";
  count: number;
};

export type VerificationDistributionDatum = {
  state: string;
  count: number;
};

export type ModerationStatusDatum = {
  status: string;
  count: number;
};

export type ModerationWatchlistRow = {
  id: number;
  role: "Worker" | "Customer";
  name: string;
  email: string;
  riskLevel: RiskLevel;
  riskScore: number;
  riskReasons: string[];
  moderation: ModerationUser;
};

const toPercent = (numerator: number, denominator: number) => {
  if (denominator <= 0) {
    return 0;
  }

  return Number(((numerator / denominator) * 100).toFixed(1));
};

export const computeAdminKpis = (
  moderation: ModerationUsersResponse
): AdminKpiSnapshot => {
  const users = [...moderation.workers, ...moderation.customers];
  const totalUsers = users.length;
  const blockedUsers = users.filter((u) => u.isBlocked).length;
  const approvedUsers = users.filter((u) => u.isApprovedByAdmin).length;
  const pendingVerification = users.filter(
    (u) => u.idVerificationStatus === "Pending"
  ).length;
  const verifiedUsers = users.filter(
    (u) => u.idVerificationStatus === "Verified"
  ).length;

  return {
    totalUsers,
    totalWorkers: moderation.workers.length,
    totalCustomers: moderation.customers.length,
    blockedUsers,
    approvedUsers,
    pendingVerification,
    verifiedUsers,
    approvalCoveragePercent: toPercent(approvedUsers, totalUsers),
  };
};

export const getRoleDistribution = (
  moderation: ModerationUsersResponse
): RoleDistributionDatum[] => [
  { role: "Workers", count: moderation.workers.length },
  { role: "Customers", count: moderation.customers.length },
];

export const getVerificationDistribution = (
  moderation: ModerationUsersResponse
): VerificationDistributionDatum[] => {
  const users = [...moderation.workers, ...moderation.customers];
  const buckets: Record<string, number> = {
    Unverified: 0,
    Pending: 0,
    Verified: 0,
    Rejected: 0,
  };

  users.forEach((user) => {
    buckets[user.idVerificationStatus] =
      (buckets[user.idVerificationStatus] ?? 0) + 1;
  });

  return Object.entries(buckets).map(([state, count]) => ({ state, count }));
};

export const getModerationDistribution = (
  moderation: ModerationUsersResponse
): ModerationStatusDatum[] => {
  const users = [...moderation.workers, ...moderation.customers];
  const blocked = users.filter((u) => u.isBlocked).length;
  const requiresReview = users.filter((u) => u.requiresAdminPreApproval).length;
  const approved = users.filter((u) => u.isApprovedByAdmin).length;

  return [
    { status: "Blocked", count: blocked },
    { status: "Requires Review", count: requiresReview },
    { status: "Approved", count: approved },
  ];
};

export const computeRisk = (
  moderationUser: ModerationUser,
  metrics?: WorkerAcceptanceMetrics
): { riskLevel: RiskLevel; riskScore: number; reasons: string[] } => {
  let score = 0;
  const reasons: string[] = [];

  if (moderationUser.isBlocked) {
    score += 60;
    reasons.push("Account is blocked");
  }

  if (!moderationUser.isApprovedByAdmin) {
    score += 15;
    reasons.push("Awaiting admin approval");
  }

  if (moderationUser.idVerificationStatus === "Pending") {
    score += 10;
    reasons.push("ID verification pending");
  }

  if (moderationUser.idVerificationStatus === "Rejected") {
    score += 25;
    reasons.push("ID verification rejected");
  }

  if (!moderationUser.isEmailVerified || !moderationUser.isPhoneVerified) {
    score += 10;
    reasons.push("Contact verification incomplete");
  }

  if (metrics) {
    if (
      metrics.responseAcceptanceRatePercent <
      METRICS_THRESHOLDS.responseAcceptanceRateGood
    ) {
      score += 20;
      reasons.push("Low response acceptance rate");
    }

    if (metrics.averageResponseTimeMinutes > METRICS_THRESHOLDS.avgResponseMinutesGood) {
      score += 15;
      reasons.push("Slow average response time");
    }

    if (
      metrics.bookingAcceptanceRatePercent <
      METRICS_THRESHOLDS.bookingAcceptanceRateGood
    ) {
      score += 15;
      reasons.push("Low booking acceptance rate");
    }
  }

  let riskLevel: RiskLevel = "Low";
  if (score >= 55) {
    riskLevel = "High";
  } else if (score >= 25) {
    riskLevel = "Medium";
  }

  return { riskLevel, riskScore: score, reasons };
};

export const buildModerationWatchlist = (
  moderation: ModerationUsersResponse,
  workerMetricsById: Record<number, WorkerAcceptanceMetrics>
): ModerationWatchlistRow[] => {
  const users = [...moderation.workers, ...moderation.customers];

  return users
    .map((user) => {
      const metrics =
        user.role === "Worker" ? workerMetricsById[user.id] : undefined;
      const risk = computeRisk(user, metrics);

      return {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        riskLevel: risk.riskLevel,
        riskScore: risk.riskScore,
        riskReasons: risk.reasons,
        moderation: user,
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore);
};

export const getRiskDistribution = (watchlist: ModerationWatchlistRow[]) => {
  const counts: Record<RiskLevel, number> = {
    Low: 0,
    Medium: 0,
    High: 0,
  };

  watchlist.forEach((row) => {
    counts[row.riskLevel] += 1;
  });

  return [
    { level: "High", count: counts.High },
    { level: "Medium", count: counts.Medium },
    { level: "Low", count: counts.Low },
  ];
};
