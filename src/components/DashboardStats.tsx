
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, FileText, DollarSign } from 'lucide-react';
import { Quotation, User } from '@/types';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

const StatsCard = ({ title, value, change, isPositive, icon }: StatsCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className={`text-xs flex items-center ${
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        <span className="ml-1">{change} from last month</span>
      </p>
    </CardContent>
  </Card>
);

interface DashboardStatsProps {
  user: User;
  users: User[];
  quotations: Quotation[];
}

const DashboardStats = ({ user, users, quotations }: DashboardStatsProps) => {
  const getStats = () => {
    const formatRevenue = (num: number) => {
      if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
      return `$${num}`;
    };

    switch (user.role) {
      case 'admin': {
        const pendingApprovals = quotations.filter(q => q.status === 'pending').length;
        const approvedThisMonth = quotations.filter(q => {
          if (q.status !== 'won' || !q.approvedAt) return false;
          const approvedDate = new Date(q.approvedAt);
          const now = new Date();
          return approvedDate.getMonth() === now.getMonth() && approvedDate.getFullYear() === now.getFullYear();
        }).length;
        const totalRevenue = quotations
          .filter(q => q.status === 'won')
          .reduce((sum, q) => sum + q.clientQuote, 0);

        return [
          {
            title: 'Total Users',
            value: users.length.toString(),
            change: '+2', // Kept for demo
            isPositive: true,
            icon: <Users className="h-4 w-4 text-slate-600" />
          },
          {
            title: 'Pending Approvals',
            value: pendingApprovals.toString(),
            change: '+3', // Kept for demo
            isPositive: pendingApprovals <= 5,
            icon: <FileText className="h-4 w-4 text-slate-600" />
          },
          {
            title: 'Approved This Month',
            value: approvedThisMonth.toString(),
            change: '+12', // Kept for demo
            isPositive: true,
            icon: <FileText className="h-4 w-4 text-slate-600" />
          },
          {
            title: 'Total Revenue',
            value: formatRevenue(totalRevenue),
            change: '+8.1%', // Kept for demo
            isPositive: true,
            icon: <DollarSign className="h-4 w-4 text-slate-600" />
          }
        ];
      }
      case 'sales_director': {
        const myQuotations = quotations.filter(q => q.quoteSentBy === user.name);
        const wonDeals = myQuotations.filter(q => q.status === 'won');
        const winRate = myQuotations.length > 0 ? `${Math.round((wonDeals.length / myQuotations.length) * 100)}%` : '0%';
        
        return [
          {
            title: 'My Quotations',
            value: myQuotations.length.toString(),
            change: '+12', // Kept for demo
            isPositive: true,
            icon: <FileText className="h-4 w-4 text-slate-600" />
          },
          {
            title: 'Pending Approval',
            value: myQuotations.filter(q => q.status === 'pending').length.toString(),
            change: '+3', // Kept for demo
            isPositive: false,
            icon: <FileText className="h-4 w-4 text-slate-600" />
          },
          {
            title: 'Won Deals',
            value: wonDeals.length.toString(),
            change: '+15', // Kept for demo
            isPositive: true,
            icon: <TrendingUp className="h-4 w-4 text-slate-600" />
          },
          {
            title: 'Win Rate',
            value: winRate,
            change: '+5.2%', // Kept for demo
            isPositive: true,
            icon: <TrendingUp className="h-4 w-4 text-slate-600" />
          }
        ];
      }
      default:
        return [];
    }
  };

  const stats = getStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default DashboardStats;
