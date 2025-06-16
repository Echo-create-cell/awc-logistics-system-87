
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, FileText, DollarSign } from 'lucide-react';

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
  userRole: string;
}

const DashboardStats = ({ userRole }: DashboardStatsProps) => {
  const getStats = () => {
    switch (userRole) {
      case 'admin':
        return [
          {
            title: 'Total Users',
            value: '24',
            change: '+2',
            isPositive: true,
            icon: <Users className="h-4 w-4 text-slate-600" />
          },
          {
            title: 'Pending Approvals',
            value: '8',
            change: '+3',
            isPositive: false,
            icon: <FileText className="h-4 w-4 text-slate-600" />
          },
          {
            title: 'Approved This Month',
            value: '42',
            change: '+12',
            isPositive: true,
            icon: <FileText className="h-4 w-4 text-slate-600" />
          },
          {
            title: 'Total Revenue',
            value: '$2.4M',
            change: '+8.1%',
            isPositive: true,
            icon: <DollarSign className="h-4 w-4 text-slate-600" />
          }
        ];
      case 'sales_director':
        return [
          {
            title: 'My Quotations',
            value: '156',
            change: '+12',
            isPositive: true,
            icon: <FileText className="h-4 w-4 text-slate-600" />
          },
          {
            title: 'Pending Approval',
            value: '8',
            change: '+3',
            isPositive: false,
            icon: <FileText className="h-4 w-4 text-slate-600" />
          },
          {
            title: 'Won Deals',
            value: '89',
            change: '+15',
            isPositive: true,
            icon: <TrendingUp className="h-4 w-4 text-slate-600" />
          },
          {
            title: 'Win Rate',
            value: '74%',
            change: '+5.2%',
            isPositive: true,
            icon: <TrendingUp className="h-4 w-4 text-slate-600" />
          }
        ];
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
