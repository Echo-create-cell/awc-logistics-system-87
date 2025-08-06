
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserActivity } from '@/types/reports';
import { formatDistanceToNow } from 'date-fns';

interface UserActivityTableProps {
  userActivities: UserActivity[];
  canViewAllUsers: boolean;
}

const UserActivityTable = ({ userActivities, canViewAllUsers }: UserActivityTableProps) => {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  if (!canViewAllUsers) {
    return null;
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>User Activity Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Quotations Created</TableHead>
                <TableHead>Won</TableHead>
                <TableHead>Lost</TableHead>
                <TableHead>Win Rate</TableHead>
                <TableHead>Total Profit</TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Activities</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userActivities.map((activity) => (
                <TableRow key={activity.userId}>
                  <TableCell className="font-medium">{activity.userName}</TableCell>
                  <TableCell>{activity.quotationsCreated}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-green-600">
                      {activity.quotationsWon}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-red-600">
                      {activity.quotationsLost}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={activity.winRate >= 50 ? "default" : "secondary"}
                      className={activity.winRate >= 50 ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}
                    >
                      {formatPercentage(activity.winRate)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-blue-600 font-medium">
                    {formatCurrency(activity.totalProfit)}
                  </TableCell>
                  <TableCell className="text-green-600 font-medium">
                    {formatCurrency(activity.totalRevenue)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.lastActive), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {activity.activitiesCount}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserActivityTable;
