import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { Activity, Clock, User as UserIcon, FileText, DollarSign, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'quotation' | 'invoice' | 'user_activity';
  title: string;
  description: string;
  user: string;
  timestamp: string;
  amount?: number;
  status?: string;
}

interface PartnerRecentActivityProps {
  users: User[];
  quotations: Quotation[];
  invoices: InvoiceData[];
}

const PartnerRecentActivity = ({ users, quotations, invoices }: PartnerRecentActivityProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Show fewer items per page for better UX

  // Generate activity data from all sources
  const activityData = useMemo(() => {
    const activities: ActivityItem[] = [];

    // Add quotation activities
    quotations.forEach(q => {
      activities.push({
        id: `quotation-${q.id}`,
        type: 'quotation',
        title: 'Quotation Created',
        description: `New quotation for ${q.clientName} - ${q.cargoDescription || 'Various cargo'}`,
        user: q.quoteSentBy || 'Unknown User',
        timestamp: q.createdAt,
        amount: q.clientQuote,
        status: q.status
      });

      if (q.status === 'won' && q.approvedBy) {
        activities.push({
          id: `quotation-approved-${q.id}`,
          type: 'quotation',
          title: 'Quotation Approved',
          description: `Quotation for ${q.clientName} has been approved`,
          user: q.approvedBy,
          timestamp: q.approvedAt || q.createdAt,
          amount: q.clientQuote,
          status: 'approved'
        });
      }
    });

    // Add invoice activities
    invoices.forEach(inv => {
      activities.push({
        id: `invoice-${inv.id}`,
        type: 'invoice',
        title: 'Invoice Generated',
        description: `Invoice ${inv.invoiceNumber} created for ${inv.clientName}`,
        user: inv.createdBy || 'Unknown User',
        timestamp: inv.createdAt,
        amount: inv.totalAmount,
        status: inv.status
      });
    });

    // Add user activities (simplified)
    users.forEach(user => {
      activities.push({
        id: `user-${user.id}`,
        type: 'user_activity',
        title: 'User Account Created',
        description: `New ${user.role.replace('_', ' ')} account created for ${user.name}`,
        user: 'System Administrator',
        timestamp: user.createdAt,
        status: user.status
      });
    });

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [users, quotations, invoices]);

  // Filter activities based on search term
  const filteredActivities = useMemo(() => {
    if (!searchTerm) return activityData;
    
    return activityData.filter(activity =>
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activityData, searchTerm]);

  // Paginate filtered activities
  const paginatedActivities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredActivities.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredActivities, currentPage]);

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quotation': return <FileText className="h-4 w-4" />;
      case 'invoice': return <DollarSign className="h-4 w-4" />;
      case 'user_activity': return <UserIcon className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'quotation': return 'bg-primary/10 text-primary border-primary/20';
      case 'invoice': return 'bg-success/10 text-success border-success/20';
      case 'user_activity': return 'bg-accent/10 text-accent border-accent/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusColors = {
      pending: 'bg-warning/10 text-warning border-warning/20',
      won: 'bg-success/10 text-success border-success/20',
      approved: 'bg-success/10 text-success border-success/20',
      lost: 'bg-destructive/10 text-destructive border-destructive/20',
      active: 'bg-success/10 text-success border-success/20',
      paid: 'bg-success/10 text-success border-success/20',
      overdue: 'bg-destructive/10 text-destructive border-destructive/20'
    };

    return (
      <Badge variant="outline" className={statusColors[status as keyof typeof statusColors] || ''}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <Card className="hover-lift glass-effect">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl font-display font-semibold">
          <Activity className="h-5 w-5 text-primary" />
          Recent Activity ({filteredActivities.length} items)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Latest system activities and business updates
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
            className="pl-9"
          />
        </div>

        {/* Activity List */}
        <div className="space-y-3">
          {paginatedActivities.length > 0 ? (
            paginatedActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                <div className={`p-2 rounded-full border ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-medium text-foreground">{activity.title}</p>
                    {activity.status && getStatusBadge(activity.status)}
                    {activity.amount && (
                      <Badge variant="secondary" className="text-xs">
                        ${activity.amount.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <UserIcon className="h-3 w-3" />
                      {activity.user}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No activities found matching your search.' : 'No recent activities found.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredActivities.length)} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredActivities.length)} of {filteredActivities.length} activities
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="px-3 py-1 text-sm font-medium bg-muted/50 rounded-md">
                {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PartnerRecentActivity;