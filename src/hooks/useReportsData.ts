
import { useState, useMemo } from 'react';
import { User, Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { ReportData, ReportFilters, FinancialMetrics, UserActivity } from '@/types/reports';

export const useReportsData = (
  quotations: Quotation[],
  invoices: InvoiceData[],
  users: User[],
  user?: User | null
) => {
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: {
      from: new Date(new Date().getFullYear(), 0, 1), // Start of current year
      to: new Date() // Today
    },
    includeUserActivity: true
  });

  const filteredData = useMemo(() => {
    const { dateRange, userIds, status } = filters;
    
    // Filter quotations by date range and user permissions
    let filteredQuotations = quotations.filter(q => {
      const createdDate = new Date(q.createdAt);
      const inDateRange = createdDate >= dateRange.from && createdDate <= dateRange.to;
      
      // Role-based filtering - Partners can see all data like admins
      if (user?.role === 'sales_agent') {
        // Sales agents can see all quotations in reports (RLS controls access)
        return inDateRange;
      }
      if (user?.role === 'sales_director') {
        const salesAgents = users.filter(u => u.role === 'sales_agent').map(u => u.name);
        return inDateRange && (q.quoteSentBy === user.name || salesAgents.includes(q.quoteSentBy));
      }
      // Partners and admins see all data
      if (user?.role === 'partner' || user?.role === 'admin' || user?.role === 'finance_officer') {
        return inDateRange;
      }
      
      return inDateRange;
    });

    // Filter invoices by date range
    let filteredInvoices = invoices.filter(i => {
      const issueDate = new Date(i.issueDate);
      return issueDate >= dateRange.from && issueDate <= dateRange.to;
    });

    // Apply additional filters
    if (userIds && userIds.length > 0 && !userIds.includes('__all__')) {
      const userNames = users.filter(u => userIds.includes(u.id)).map(u => u.name);
      filteredQuotations = filteredQuotations.filter(q => userNames.includes(q.quoteSentBy));
    }

    if (status && status.length > 0 && !status.includes('__all__')) {
      filteredQuotations = filteredQuotations.filter(q => status.includes(q.status));
      filteredInvoices = filteredInvoices.filter(i => status.includes(i.status));
    }

    return { quotations: filteredQuotations, invoices: filteredInvoices };
  }, [quotations, invoices, users, filters, user]);

  const reportData = useMemo((): ReportData => {
    const { quotations: filteredQuotations, invoices: filteredInvoices } = filteredData;

    // Calculate financial metrics
    const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalProfit = filteredQuotations.reduce((sum, q) => sum + (q.status === 'won' ? q.profit : 0), 0);
    const totalLoss = filteredQuotations.reduce((sum, q) => sum + (q.status === 'lost' ? q.profit : 0), 0);
    const paidInvoices = filteredInvoices.filter(i => i.status === 'paid').length;
    const pendingInvoices = filteredInvoices.filter(i => i.status === 'pending').length;
    const overdueInvoices = filteredInvoices.filter(i => i.status === 'overdue').length;
    const wonQuotations = filteredQuotations.filter(q => q.status === 'won').length;
    const winRate = filteredQuotations.length > 0 ? (wonQuotations / filteredQuotations.length) * 100 : 0;

    const metrics: FinancialMetrics = {
      totalRevenue,
      totalProfit,
      totalLoss,
      totalInvoices: filteredInvoices.length,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      avgDealSize: filteredInvoices.length > 0 ? totalRevenue / filteredInvoices.length : 0,
      winRate
    };

    // Calculate user activities
    const userActivities: UserActivity[] = users.map(u => {
      const userQuotations = filteredQuotations.filter(q => q.quoteSentBy === u.name);
      const userWonQuotations = userQuotations.filter(q => q.status === 'won');
      const userLostQuotations = userQuotations.filter(q => q.status === 'lost');
      const userProfit = userWonQuotations.reduce((sum, q) => sum + q.profit, 0);
      const userInvoices = filteredInvoices.filter(i => i.createdBy === u.name);
      const userRevenue = userInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

      return {
        userId: u.id,
        userName: u.name,
        quotationsCreated: userQuotations.length,
        quotationsWon: userWonQuotations.length,
        quotationsLost: userLostQuotations.length,
        totalProfit: userProfit,
        totalRevenue: userRevenue,
        winRate: userQuotations.length > 0 ? (userWonQuotations.length / userQuotations.length) * 100 : 0,
        lastActive: userQuotations.length > 0 ? userQuotations[0].createdAt : u.createdAt,
        activitiesCount: userQuotations.length + userInvoices.length
      };
    }).filter(ua => ua.activitiesCount > 0 || user?.role === 'admin');

    // Calculate monthly trends
    const monthlyMap = new Map<string, { revenue: number; profit: number; quotations: number }>();
    
    filteredInvoices.forEach(inv => {
      const month = new Date(inv.issueDate).toISOString().slice(0, 7);
      const current = monthlyMap.get(month) || { revenue: 0, profit: 0, quotations: 0 };
      monthlyMap.set(month, {
        ...current,
        revenue: current.revenue + inv.totalAmount
      });
    });

    filteredQuotations.forEach(q => {
      const month = new Date(q.createdAt).toISOString().slice(0, 7);
      const current = monthlyMap.get(month) || { revenue: 0, profit: 0, quotations: 0 };
      monthlyMap.set(month, {
        ...current,
        profit: current.profit + (q.status === 'won' ? q.profit : 0),
        quotations: current.quotations + 1
      });
    });

    const monthlyTrends = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Calculate top clients from both invoices and quotations
    const clientMap = new Map<string, { revenue: number; quotations: number }>();
    
    // Add invoice data
    filteredInvoices.forEach(inv => {
      const current = clientMap.get(inv.clientName) || { revenue: 0, quotations: 0 };
      clientMap.set(inv.clientName, {
        revenue: current.revenue + inv.totalAmount,
        quotations: current.quotations + 1
      });
    });

    // Add quotation data (for clients without invoices or additional quotations)
    filteredQuotations.forEach(q => {
      if (q.clientName) {
        const current = clientMap.get(q.clientName) || { revenue: 0, quotations: 0 };
        // Use clientQuote as revenue if no invoice exists for this client
        const hasInvoice = filteredInvoices.some(inv => inv.clientName === q.clientName);
        clientMap.set(q.clientName, {
          revenue: hasInvoice ? current.revenue : current.revenue + (q.status === 'won' ? q.clientQuote : 0),
          quotations: current.quotations + 1
        });
      }
    });

    const topClients = Array.from(clientMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .filter(client => client.revenue > 0) // Only show clients with revenue
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      dateRange: filters.dateRange,
      metrics,
      userActivities,
      monthlyTrends,
      topClients
    };
  }, [filteredData, users, filters, user]);

  return {
    reportData,
    filters,
    setFilters,
    canViewAllUsers: user?.role === 'admin' || user?.role === 'sales_director' || user?.role === 'finance_officer' || user?.role === 'partner'
  };
};
