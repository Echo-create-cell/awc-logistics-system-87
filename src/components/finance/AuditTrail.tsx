import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Download,
  Eye,
  Calendar
} from 'lucide-react';
import { User, Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { generateAuditReport } from './AccountingReportUtils';

interface ActivityLog {
  id: string;
  type: 'invoice' | 'quotation' | 'user' | 'system';
  action: string;
  entityId: string;
  entityName: string;
  userId: string;
  userName: string;
  timestamp: string;
  details: string;
  amount?: number;
  status?: string;
  changes?: any;
}

interface AuditTrailProps {
  invoices: InvoiceData[];
  quotations: Quotation[];
  users: User[];
  reportPeriod: { from: string; to: string };
  user: User;
}

const AuditTrail = ({ invoices, quotations, users, reportPeriod, user }: AuditTrailProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  // Generate audit trail from data
  const auditTrail = useMemo((): ActivityLog[] => {
    const activities: ActivityLog[] = [];

    // Add invoice activities
    invoices.forEach(invoice => {
      activities.push({
        id: `inv-${invoice.id}`,
        type: 'invoice',
        action: 'Created',
        entityId: invoice.id,
        entityName: `Invoice - ${invoice.clientName}`,
        userId: invoice.createdBy || 'system',
        userName: invoice.createdBy || 'System',
        timestamp: invoice.createdAt,
        details: `Invoice created for ${invoice.clientName} - ${formatCurrency(invoice.totalAmount)}`,
        amount: invoice.totalAmount,
        status: invoice.status
      });

      if (invoice.status === 'paid') {
        activities.push({
          id: `inv-paid-${invoice.id}`,
          type: 'invoice',
          action: 'Payment Received',
          entityId: invoice.id,
          entityName: `Invoice - ${invoice.clientName}`,
          userId: invoice.createdBy || 'system',
          userName: 'Finance Team',
          timestamp: invoice.createdAt,
          details: `Payment received for invoice ${invoice.invoiceNumber || invoice.id.slice(0, 8)}`,
          amount: invoice.totalAmount,
          status: 'paid'
        });
      }
    });

    // Add quotation activities
    quotations.forEach(quotation => {
      activities.push({
        id: `quot-${quotation.id}`,
        type: 'quotation',
        action: 'Created',
        entityId: quotation.id,
        entityName: `Quotation - ${quotation.clientName}`,
        userId: 'system',
        userName: quotation.quoteSentBy || 'Unknown',
        timestamp: quotation.createdAt,
        details: `Quotation created for ${quotation.clientName} - ${formatCurrency(quotation.clientQuote || 0)}`,
        amount: quotation.clientQuote,
        status: quotation.status
      });

      if (quotation.approvedAt && quotation.status === 'won') {
        activities.push({
          id: `quot-approved-${quotation.id}`,
          type: 'quotation',
          action: 'Approved',
          entityId: quotation.id,
          entityName: `Quotation - ${quotation.clientName}`,
          userId: 'system',
          userName: quotation.approvedBy || 'System',
          timestamp: quotation.approvedAt,
          details: `Quotation approved and converted to won status`,
          amount: quotation.clientQuote,
          status: 'won'
        });
      }
    });

    // Add user activities
    users.forEach(u => {
      activities.push({
        id: `user-${u.id}`,
        type: 'user',
        action: 'Account Created',
        entityId: u.id,
        entityName: `User - ${u.name}`,
        userId: 'system',
        userName: 'System Administrator',
        timestamp: u.createdAt,
        details: `User account created with role: ${u.role.replace('_', ' ')}`,
        status: u.status
      });
    });

    // Sort by timestamp (newest first)
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [invoices, quotations, users]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return auditTrail.filter(activity => {
      // Date range filter
      const activityDate = new Date(activity.timestamp);
      const fromDate = new Date(reportPeriod.from);
      const toDate = new Date(reportPeriod.to);
      if (activityDate < fromDate || activityDate > toDate) return false;

      // Search filter
      if (searchTerm && !activity.entityName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !activity.details.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !activity.userName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Type filter
      if (filterType !== 'all' && activity.type !== filterType) return false;

      // User filter
      if (filterUser !== 'all' && activity.userName !== filterUser) return false;

      return true;
    });
  }, [auditTrail, searchTerm, filterType, filterUser, reportPeriod]);

  const handleExportAuditReport = async () => {
    await generateAuditReport(invoices, quotations, users, user, reportPeriod);
  };

  const getActivityIcon = (type: string, action: string) => {
    switch (type) {
      case 'invoice':
        return action === 'Payment Received' ? 
          <CheckCircle className="h-4 w-4 text-green-600" /> : 
          <FileText className="h-4 w-4 text-blue-600" />;
      case 'quotation':
        return action === 'Approved' ? 
          <CheckCircle className="h-4 w-4 text-green-600" /> : 
          <FileText className="h-4 w-4 text-purple-600" />;
      case 'user':
        return <Users className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'paid': 'bg-green-100 text-green-800',
      'won': 'bg-green-100 text-green-800',
      'pending': 'bg-amber-100 text-amber-800',
      'lost': 'bg-red-100 text-red-800',
      'active': 'bg-blue-100 text-blue-800',
      'inactive': 'bg-gray-100 text-gray-800'
    };

    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  const uniqueUsers = Array.from(new Set(auditTrail.map(a => a.userName)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-primary" />
            Audit Trail & System Activity
          </h2>
          <p className="text-muted-foreground mt-1">
            Complete audit trail of all system activities and transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportAuditReport} className="flex items-center gap-2">
            <Download size={16} />
            Export Audit Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Activity Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Activities</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by entity, user, or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Activity Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="invoice">Invoices</SelectItem>
                  <SelectItem value="quotation">Quotations</SelectItem>
                  <SelectItem value="user">User Activities</SelectItem>
                  <SelectItem value="system">System Events</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>User</Label>
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map(userName => (
                    <SelectItem key={userName} value={userName}>
                      {userName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterUser('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Total Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {filteredActivities.length}
            </div>
            <p className="text-xs text-muted-foreground">
              In selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {uniqueUsers.length}
            </div>
            <p className="text-xs text-muted-foreground">
              System participants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-purple-600" />
              Completed Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {filteredActivities.filter(a => a.action.includes('Approved') || a.action.includes('Payment')).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successful operations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Pending Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {filteredActivities.filter(a => a.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Activity Timeline
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({filteredActivities.length} activities)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredActivities.slice(0, 50).map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => setSelectedActivity(activity)}
              >
                <div className="mt-1">
                  {getActivityIcon(activity.type, activity.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">
                      {activity.action} - {activity.entityName}
                    </p>
                    <div className="flex items-center gap-2">
                      {activity.amount && (
                        <span className="text-sm font-semibold text-green-600">
                          {formatCurrency(activity.amount)}
                        </span>
                      )}
                      {activity.status && (
                        <Badge className={getStatusBadge(activity.status)}>
                          {activity.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.details}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {activity.userName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedActivity(activity);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredActivities.length > 50 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Showing 50 of {filteredActivities.length} activities. Use filters to narrow results.
              </div>
            )}
            
            {filteredActivities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No activities found matching the current filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Detail Modal/Panel */}
      {selectedActivity && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {getActivityIcon(selectedActivity.type, selectedActivity.action)}
                Activity Details
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedActivity(null)}
              >
                ✕
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Activity Type</Label>
                  <p className="text-sm font-semibold capitalize">{selectedActivity.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Action</Label>
                  <p className="text-sm font-semibold">{selectedActivity.action}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Entity</Label>
                  <p className="text-sm">{selectedActivity.entityName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="text-sm">{selectedActivity.details}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Performed By</Label>
                  <p className="text-sm font-semibold">{selectedActivity.userName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Timestamp</Label>
                  <p className="text-sm">{new Date(selectedActivity.timestamp).toLocaleString()}</p>
                </div>
                {selectedActivity.amount && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                    <p className="text-sm font-semibold text-green-600">
                      {formatCurrency(selectedActivity.amount)}
                    </p>
                  </div>
                )}
                {selectedActivity.status && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge className={getStatusBadge(selectedActivity.status)}>
                      {selectedActivity.status}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuditTrail;