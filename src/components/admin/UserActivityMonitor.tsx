
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { Activity, TrendingUp, Clock, Target } from 'lucide-react';
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          User Activity Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeUsers.map(user => {
            const activity = getUserActivity(user);
            
            return (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {user.role.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="flex items-center space-x-1">
                      <Target className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">{activity.totalQuotations}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Quotations</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">{activity.wonQuotations}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Won</p>
                  </div>
                  
                  <div className="text-center">
                    <Badge 
                      variant={activity.winRate >= 50 ? "default" : "secondary"}
                      className={activity.winRate >= 50 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                    >
                      {activity.winRate.toFixed(1)}%
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">Win Rate</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">
                        {formatDistanceToNow(new Date(activity.lastActivity), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Last Active</p>
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
