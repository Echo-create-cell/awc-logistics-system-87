
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { Activity, Clock, User as UserIcon, FileText, DollarSign, Search, Filter, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UserLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  actionType: 'quotation' | 'invoice' | 'user_management' | 'login' | 'logout' | 'settings';
  details: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface UserLogsMonitorProps {
  users: User[];
  quotations: Quotation[];
  invoices: InvoiceData[];
}

const UserLogsMonitor = ({ users, quotations, invoices }: UserLogsMonitorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Generate comprehensive user logs
  const userLogs = useMemo(() => {
    const logs: UserLog[] = [];

    // Generate logs from quotations
    quotations.forEach(q => {
      logs.push({
        id: `quotation-${q.id}`,
        userId: q.quoteSentBy || 'unknown',
        userName: q.quoteSentBy || 'Unknown User',
        userRole: users.find(u => u.name === q.quoteSentBy)?.role || 'unknown',
        action: 'Created Quotation',
        actionType: 'quotation',
        details: `Created quotation for ${q.clientName} - ${q.cargoDescription || 'N/A'}`,
        timestamp: q.createdAt,
        metadata: { quotationId: q.id, clientName: q.clientName, amount: q.clientQuote }
      });

      if (q.status === 'won' && q.approvedBy) {
        logs.push({
          id: `quotation-approved-${q.id}`,
          userId: q.approvedBy,
          userName: q.approvedBy,
          userRole: 'admin',
          action: 'Approved Quotation',
          actionType: 'quotation',
          details: `Approved quotation for ${q.clientName}`,
          timestamp: q.approvedAt || q.createdAt,
          metadata: { quotationId: q.id, clientName: q.clientName }
        });
      }
    });

    // Generate logs from invoices
    invoices.forEach(inv => {
      logs.push({
        id: `invoice-${inv.id}`,
        userId: inv.createdBy || 'unknown',
        userName: inv.createdBy || 'Unknown User',
        userRole: users.find(u => u.name === inv.createdBy)?.role || 'unknown',
        action: 'Created Invoice',
        actionType: 'invoice',
        details: `Generated invoice ${inv.invoiceNumber} for ${inv.clientName}`,
        timestamp: inv.createdAt,
        metadata: { invoiceId: inv.id, invoiceNumber: inv.invoiceNumber, amount: inv.totalAmount }
      });
    });

    // Generate user management logs
    users.forEach(user => {
      logs.push({
        id: `user-created-${user.id}`,
        userId: 'admin',
        userName: 'Admin User',
        userRole: 'admin',
        action: 'User Created',
        actionType: 'user_management',
        details: `Created user account for ${user.name} (${user.role})`,
        timestamp: user.createdAt,
        metadata: { targetUserId: user.id, targetUserName: user.name, targetUserRole: user.role }
      });
    });

    // Generate login logs (simulated)
    users.forEach(user => {
      const today = new Date();
      for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
        const loginTime = new Date(today.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
        logs.push({
          id: `login-${user.id}-${i}`,
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action: 'User Login',
          actionType: 'login',
          details: `User logged into the system`,
          timestamp: loginTime.toISOString(),
          metadata: { sessionId: `session-${Date.now()}-${i}` }
        });
      }
    });

    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [users, quotations, invoices]);

  const filteredLogs = useMemo(() => {
    return userLogs.filter(log => {
      const matchesSearch = searchTerm === '' || 
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = filterRole === 'all' || log.userRole === filterRole;
      const matchesAction = filterAction === 'all' || log.actionType === filterAction;
      
      return matchesSearch && matchesRole && matchesAction;
    });
  }, [userLogs, searchTerm, filterRole, filterAction]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'quotation': return <FileText className="h-4 w-4" />;
      case 'invoice': return <DollarSign className="h-4 w-4" />;
      case 'user_management': return <UserIcon className="h-4 w-4" />;
      case 'login': return <Activity className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'quotation': return 'bg-blue-100 text-blue-800';
      case 'invoice': return 'bg-green-100 text-green-800';
      case 'user_management': return 'bg-purple-100 text-purple-800';
      case 'login': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExport = () => {
    const exportData = filteredLogs.map(log => ({
      timestamp: log.timestamp,
      user: log.userName,
      role: log.userRole,
      action: log.action,
      details: log.details
    }));
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `user-logs-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          User Activity Logs
          <Badge variant="secondary" className="ml-auto">
            {filteredLogs.length} entries
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search and Filter Controls */}
        <div className="flex flex-wrap gap-4 items-center mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="sales_director">Sales Director</SelectItem>
              <SelectItem value="sales_agent">Sales Agent</SelectItem>
              <SelectItem value="finance_officer">Finance Officer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="quotation">Quotations</SelectItem>
              <SelectItem value="invoice">Invoices</SelectItem>
              <SelectItem value="user_management">User Management</SelectItem>
              <SelectItem value="login">Login Activity</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Logs List */}
        <div className="space-y-3">
          {paginatedLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`p-2 rounded-full ${getActionColor(log.actionType)}`}>
                {getActionIcon(log.actionType)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-gray-900">{log.action}</p>
                  <Badge variant="outline" className="text-xs capitalize">
                    {log.userRole.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-1">{log.details}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <UserIcon className="h-3 w-3" />
                    {log.userName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredLogs.length)} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} entries
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="px-3 py-2 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserLogsMonitor;
