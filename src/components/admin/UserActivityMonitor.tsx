
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { Activity, TrendingUp, Clock, Target, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UserActivityMonitorProps {
  users: User[];
  quotations: Quotation[];
  invoices: InvoiceData[];
}

const UserActivityMonitor = ({ users, quotations, invoices }: UserActivityMonitorProps) => {
  const getUserActivity = (user: User) => {
    const userQuotations = quotations.filter(q => q.quoteSentBy === user.name);
    const userInvoices = invoices.filter(i => i.createdBy === user.name);
    const wonQuotations = userQuotations.filter(q => q.status === 'won');
    const recentActivity = userQuotations.length > 0 ? userQuotations[0].createdAt : user.createdAt;
    
    return {
      totalQuotations: userQuotations.length,
      wonQuotations: wonQuotations.length,
      totalInvoices: userInvoices.length,
      winRate: userQuotations.length > 0 ? (wonQuotations.length / userQuotations.length) * 100 : 0,
      totalRevenue: userInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      lastActivity: recentActivity
    };
  };

  const activeUsers = users.filter(u => u.status === 'active');

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-primary/5">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          User Performance Overview
          <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary">
            {activeUsers.length} Active Users
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeUsers.map(user => {
            const activity = getUserActivity(user);
            
            return (
              <div key={user.id} className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-sm">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">{user.name}</p>
                      <Badge variant="outline" className="mt-1 capitalize font-medium bg-gray-50">
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-1">
                        <div className="p-1.5 bg-primary/10 rounded-md">
                          <Target className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-lg font-bold text-gray-900">{activity.totalQuotations}</span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">Quotations</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-1">
                        <div className="p-1.5 bg-green-100 rounded-md">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-lg font-bold text-gray-900">{activity.wonQuotations}</span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">Won</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-1">
                        <div className="p-1.5 bg-purple-100 rounded-md">
                          <DollarSign className="h-4 w-4 text-purple-600" />
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                          ${activity.totalRevenue.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">Revenue</p>
                    </div>
                    
                    <div className="text-center">
                      <Badge 
                        variant={activity.winRate >= 50 ? "default" : "secondary"}
                        className={`mb-1 px-3 py-1 text-sm font-bold ${
                          activity.winRate >= 75 ? "bg-green-500 hover:bg-green-600" :
                          activity.winRate >= 50 ? "bg-primary hover:bg-primary/90" :
                          activity.winRate >= 25 ? "bg-yellow-500 hover:bg-yellow-600 text-yellow-900" :
                          "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {activity.winRate.toFixed(1)}%
                      </Badge>
                      <p className="text-xs text-gray-500 font-medium">Win Rate</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-1">
                        <div className="p-1.5 bg-gray-100 rounded-md">
                          <Clock className="h-4 w-4 text-gray-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {formatDistanceToNow(new Date(activity.lastActivity), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">Last Active</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserActivityMonitor;
