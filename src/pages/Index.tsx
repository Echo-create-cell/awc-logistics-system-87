
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import DashboardStats from '@/components/DashboardStats';
import QuotationTable from '@/components/QuotationTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { mockQuotations, mockUsers, mockInvoices } from '@/data/mockData';
import { Quotation, User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Plus, Download, FileText, Users, BarChart3 } from 'lucide-react';

const Index = () => {
  const [currentUser] = useState<User>(mockUsers[0]); // Default to admin
  const [activeTab, setActiveTab] = useState('dashboard');
  const [quotations, setQuotations] = useState<Quotation[]>(mockQuotations);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const { toast } = useToast();

  const handleApproveQuotation = (id: string) => {
    setQuotations(prev => prev.map(q => 
      q.id === id ? { ...q, status: 'won' as const, approvedBy: currentUser.name, approvedAt: new Date().toISOString() } : q
    ));
    toast({
      title: "Quotation Approved",
      description: "The quotation has been successfully approved.",
    });
  };

  const handleRejectQuotation = (id: string) => {
    setQuotations(prev => prev.map(q => 
      q.id === id ? { ...q, status: 'lost' as const } : q
    ));
    toast({
      title: "Quotation Rejected",
      description: "The quotation has been rejected.",
      variant: "destructive",
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <DashboardStats userRole={currentUser.role} />
            <Card>
              <CardHeader>
                <CardTitle>Recent Quotations</CardTitle>
              </CardHeader>
              <CardContent>
                <QuotationTable 
                  quotations={quotations.slice(0, 5)} 
                  userRole={currentUser.role}
                  onApprove={handleApproveQuotation}
                  onReject={handleRejectQuotation}
                />
              </CardContent>
            </Card>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">User Management</h2>
              <Button>
                <Plus size={16} className="mr-2" />
                Add User
              </Button>
            </div>
            <Card>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            <Badge variant="outline" className="capitalize">
                              {user.role.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm" className="text-red-600">Delete</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'quotations':
        const pendingQuotations = quotations.filter(q => q.status === 'pending');
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {currentUser.role === 'admin' ? 'Quotation Approvals' : 'My Quotations'}
              </h2>
              {currentUser.role === 'sales_director' && (
                <Button onClick={() => setActiveTab('create')}>
                  <Plus size={16} className="mr-2" />
                  Create Quotation
                </Button>
              )}
            </div>
            <Card>
              <CardContent>
                <QuotationTable 
                  quotations={currentUser.role === 'admin' ? pendingQuotations : quotations} 
                  userRole={currentUser.role}
                  onApprove={handleApproveQuotation}
                  onReject={handleRejectQuotation}
                />
              </CardContent>
            </Card>
          </div>
        );

      case 'create':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Create New Quotation</h2>
            <Card>
              <CardHeader>
                <CardTitle>Quotation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="volume">Volume</Label>
                    <Input id="volume" placeholder="e.g., 2.4KGS, 20FT" />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="RWF">RWF</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="buyRate">Buy Rate</Label>
                    <Input id="buyRate" type="number" placeholder="0.00" />
                  </div>
                  <div>
                    <Label htmlFor="clientQuote">Client Quote</Label>
                    <Input id="clientQuote" type="number" placeholder="0.00" />
                  </div>
                  <div>
                    <Label htmlFor="followUpDate">Follow Up Date</Label>
                    <Input id="followUpDate" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input id="clientName" placeholder="Client name" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea id="remarks" placeholder="Additional notes or remarks" />
                </div>
                <Button className="w-full">Create Quotation</Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'approved':
        const approvedQuotations = quotations.filter(q => q.status === 'won');
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Approved Quotations</h2>
            <Card>
              <CardContent>
                <QuotationTable 
                  quotations={approvedQuotations} 
                  userRole={currentUser.role}
                />
              </CardContent>
            </Card>
          </div>
        );

      case 'invoices':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Generate Invoices</h2>
              <Button>
                <FileText size={16} className="mr-2" />
                New Invoice
              </Button>
            </div>
            <Card>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Invoice #</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Client</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Issue Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {mockInvoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                            {invoice.invoiceNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {invoice.clientName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {invoice.currency} {invoice.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {invoice.issueDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {invoice.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button variant="ghost" size="sm">
                              <Download size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'reports':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Financial Reports</h2>
              <Button>
                <Download size={16} className="mr-2" />
                Export Report
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">$2,456,789</div>
                  <p className="text-sm text-slate-500">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Total Quotations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">156</div>
                  <p className="text-sm text-slate-500">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Win Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">74%</div>
                  <p className="text-sm text-slate-500">This month</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Airfreight Services</span>
                    <span className="font-bold">$1,234,567</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Container Shipping</span>
                    <span className="font-bold">$987,654</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Express Delivery</span>
                    <span className="font-bold">$234,568</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <div>Content not found</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar 
        userRole={currentUser.role} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-slate-600">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default Index;
