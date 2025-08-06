
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
  <Card className="dashboard-card group cursor-pointer relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
      <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        {title}
      </CardTitle>
      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
        {icon}
      </div>
    </CardHeader>
    <CardContent className="pb-4 relative z-10">
      <div className="text-2xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
        {value}
      </div>
      <div className={`flex items-center space-x-1 text-xs transition-all duration-300 group-hover:scale-110 ${
        isPositive ? 'text-success' : 'text-destructive'
      }`}>
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        <span>{change} from last month</span>
      </div>
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
            change: '0',
            isPositive: true,
            icon: <Users className="h-4 w-4 text-primary" />
          },
          {
            title: 'Pending Approvals',
            value: pendingApprovals.toString(),
            change: '0',
            isPositive: pendingApprovals <= 5,
            icon: <FileText className="h-4 w-4 text-warning" />
          },
          {
            title: 'Approved This Month',
            value: approvedThisMonth.toString(),
            change: '0',
            isPositive: true,
            icon: <FileText className="h-4 w-4 text-success" />
          },
          {
            title: 'Total Revenue',
            value: formatRevenue(totalRevenue),
            change: '0%',
            isPositive: true,
            icon: <DollarSign className="h-4 w-4 text-accent" />
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
            change: '0',
            isPositive: true,
            icon: <FileText className="h-4 w-4 text-primary" />
          },
          {
            title: 'Pending Approval',
            value: myQuotations.filter(q => q.status === 'pending').length.toString(),
            change: '0',
            isPositive: false,
            icon: <FileText className="h-4 w-4 text-warning" />
          },
          {
            title: 'Won Deals',
            value: wonDeals.length.toString(),
            change: '0',
            isPositive: true,
            icon: <TrendingUp className="h-4 w-4 text-success" />
          },
          {
            title: 'Win Rate',
            value: winRate,
            change: '0%',
            isPositive: true,
            icon: <TrendingUp className="h-4 w-4 text-accent" />
          }
        ];
      }
      case 'partner': {
        const totalRevenue = quotations
          .filter(q => q.status === 'won')
          .reduce((sum, q) => sum + q.clientQuote, 0);
        const totalProfit = quotations
          .filter(q => q.status === 'won')
          .reduce((sum, q) => sum + q.profit, 0);
        const wonDeals = quotations.filter(q => q.status === 'won').length;
        const winRate = quotations.length > 0 ? `${Math.round((wonDeals / quotations.length) * 100)}%` : '0%';
        
        return [
          {
            title: 'Total Revenue',
            value: formatRevenue(totalRevenue),
            change: '0%',
            isPositive: true,
            icon: <DollarSign className="h-4 w-4 text-success" />
          },
          {
            title: 'Total Profit',
            value: formatRevenue(totalProfit),
            change: '0%',
            isPositive: true,
            icon: <TrendingUp className="h-4 w-4 text-primary" />
          },
          {
            title: 'Active Quotations',
            value: quotations.length.toString(),
            change: '0',
            isPositive: true,
            icon: <FileText className="h-4 w-4 text-warning" />
          },
          {
            title: 'Win Rate',
            value: winRate,
            change: '0%',
            isPositive: true,
            icon: <TrendingUp className="h-4 w-4 text-accent" />
          }
        ];
      }
      default:
        return [];
    }
  };

  const stats = getStats();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fade-in">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="opacity-0 animate-slide-up"
          style={{ 
            animationDelay: `${index * 150}ms`,
            animationFillMode: 'forwards'
          }}
        >
          <StatsCard {...stat} />
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
