
export interface DateRange {
  from: Date;
  to: Date;
}

export interface FinancialMetrics {
  totalRevenue: number;
  totalProfit: number;
  totalLoss: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  avgDealSize: number;
  winRate: number;
}

export interface UserActivity {
  userId: string;
  userName: string;
  quotationsCreated: number;
  quotationsWon: number;
  quotationsLost: number;
  totalProfit: number;
  totalRevenue: number;
  winRate: number;
  lastActive: string;
  activitiesCount: number;
}

export interface ReportData {
  dateRange: DateRange;
  metrics: FinancialMetrics;
  userActivities: UserActivity[];
  monthlyTrends: { month: string; revenue: number; profit: number; quotations: number }[];
  topClients: { name: string; revenue: number; quotations: number }[];
}

export interface ReportFilters {
  dateRange: DateRange;
  userIds?: string[];
  status?: string[];
  includeUserActivity?: boolean;
}
