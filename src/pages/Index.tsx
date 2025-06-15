
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import Sidebar from '@/components/Sidebar';
import DashboardStats from '@/components/DashboardStats';
import QuotationTable from '@/components/QuotationTable';
import InvoiceGenerator from '@/components/InvoiceGenerator';
import SearchableTable from '@/components/SearchableTable';
import InvoicePrintPreview from '@/components/InvoicePrintPreview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { mockQuotations, mockUsers, mockInvoices } from '@/data/mockData';
import { Quotation, User } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { useToast } from '@/hooks/use-toast';
import { Plus, Download, FileText, Users, BarChart3, Eye, Printer } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [quotations, setQuotations] = useState<Quotation[]>(mockQuotations);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [printPreview, setPrintPreview] = useState<InvoiceData | null>(null);
  const { toast } = useToast();

  // Show login form if not authenticated
  if (!user) {
    return <LoginForm />;
  }

  const handleApproveQuotation = (id: string) => {
    setQuotations(prev => prev.map(q => 
      q.id === id ? { ...q, status: 'won' as const, approvedBy: user.name, approvedAt: new Date().toISOString() } : q
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

  const handleSaveInvoice = (invoice: InvoiceData) => {
    setInvoices(prev => [...prev, invoice]);
  };

  const handlePrintInvoice = (invoice: InvoiceData) => {
    setPrintPreview(invoice);
  };

  const handleViewQuotation = (quotation: Quotation) => {
    toast({
      title: "Quotation Details",
      description: `Viewing quotation ${quotation.id}`,
    });
  };

  const handleViewInvoice = (invoice: InvoiceData) => {
    setPrintPreview(invoice);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <DashboardStats userRole={user.role} />
            <Card>
              <CardHeader>
                <CardTitle>Recent Quotations</CardTitle>
              </CardHeader>
              <CardContent>
                <QuotationTable 
                  quotations={quotations.slice(0, 5)} 
                  userRole={user.role}
                  onApprove={handleApproveQuotation}
                  onReject={handleRejectQuotation}
                  onView={handleViewQuotation}
                />
              </CardContent>
            </Card>
          </div>
        );

      case 'users':
        const userColumns = [
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { 
            key: 'role', 
            label: 'Role',
            render: (value: string) => (
              <Badge variant="outline" className="capitalize">
                {value.replace('_', ' ')}
              </Badge>
            )
          },
          { 
            key: 'status', 
            label: 'Status',
            render: (value: string) => (
              <Badge className={value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {value}
              </Badge>
            )
          }
        ];

        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">User Management</h2>
              <Button>
                <Plus size={16} className="mr-2" />
                Add User
              </Button>
            </div>
            <SearchableTable
              title="Users"
              data={users}
              columns={userColumns}
              searchFields={['name', 'email', 'role']}
              filterOptions={[
                {
                  key: 'role',
                  label: 'Role',
                  options: [
                    { value: 'admin', label: 'Admin' },
                    { value: 'sales_director', label: 'Sales Director' },
                    { value: 'sales_agent', label: 'Sales Agent' },
                    { value: 'finance_officer', label: 'Finance Officer' }
                  ]
                },
                {
                  key: 'status',
                  label: 'Status',
                  options: [
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' }
                  ]
                }
              ]}
            />
          </div>
        );

      case 'quotations':
        const quotationColumns = [
          { key: 'volume', label: 'Volume' },
          { 
            key: 'buyRate', 
            label: 'Buy Rate',
            render: (value: number, row: Quotation) => `${row.currency} ${value.toLocaleString()}`
          },
          { 
            key: 'clientQuote', 
            label: 'Client Quote',
            render: (value: number, row: Quotation) => `${row.currency} ${value.toLocaleString()}`
          },
          { 
            key: 'profit', 
            label: 'Profit',
            render: (value: number, row: Quotation) => `${row.currency} ${value.toLocaleString()}`
          },
          { key: 'quoteSentBy', label: 'Quote Sent By' },
          { 
            key: 'status', 
            label: 'Status',
            render: (value: string) => {
              const colors = {
                won: 'bg-green-100 text-green-800',
                pending: 'bg-yellow-100 text-yellow-800',
                lost: 'bg-red-100 text-red-800'
              };
              return <Badge className={colors[value as keyof typeof colors]}>{value}</Badge>;
            }
          }
        ];

        const filteredQuotations = user.role === 'admin' 
          ? quotations.filter(q => q.status === 'pending')
          : quotations;

        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {user.role === 'admin' ? 'Quotation Approvals' : 'My Quotations'}
              </h2>
              {(user.role === 'sales_director' || user.role === 'sales_agent') && (
                <Button onClick={() => setActiveTab('create')}>
                  <Plus size={16} className="mr-2" />
                  Create Quotation
                </Button>
              )}
            </div>
            <SearchableTable
              title="Quotations"
              data={filteredQuotations}
              columns={quotationColumns}
              searchFields={['volume', 'quoteSentBy', 'currency']}
              filterOptions={[
                {
                  key: 'status',
                  label: 'Status',
                  options: [
                    { value: 'pending', label: 'Pending' },
                    { value: 'won', label: 'Won' },
                    { value: 'lost', label: 'Lost' }
                  ]
                },
                {
                  key: 'currency',
                  label: 'Currency',
                  options: [
                    { value: 'USD', label: 'USD' },
                    { value: 'EUR', label: 'EUR' },
                    { value: 'RWF', label: 'RWF' }
                  ]
                }
              ]}
              onView={handleViewQuotation}
              onPrint={(quotation) => window.print()}
            />
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

      case 'invoices':
        if (user.role === 'sales_director' || user.role === 'sales_agent') {
          return (
            <InvoiceGenerator 
              onSave={handleSaveInvoice}
              onPrint={handlePrintInvoice}
            />
          );
        }

        const invoiceColumns = [
          { key: 'invoiceNumber', label: 'Invoice #' },
          { key: 'clientName', label: 'Client' },
          { 
            key: 'totalAmount', 
            label: 'Amount',
            render: (value: number, row: InvoiceData) => `${row.currency} ${value.toLocaleString()}`
          },
          { 
            key: 'issueDate', 
            label: 'Issue Date',
            render: (value: string) => new Date(value).toLocaleDateString()
          },
          { 
            key: 'status', 
            label: 'Status',
            render: (value: string) => {
              const colors = {
                paid: 'bg-green-100 text-green-800',
                pending: 'bg-yellow-100 text-yellow-800',
                overdue: 'bg-red-100 text-red-800'
              };
              return <Badge className={colors[value as keyof typeof colors]}>{value}</Badge>;
            }
          }
        ];

        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Invoices</h2>
              <Button onClick={() => setActiveTab('invoices')}>
                <FileText size={16} className="mr-2" />
                New Invoice
              </Button>
            </div>
            <SearchableTable
              title="Generated Invoices"
              data={invoices}
              columns={invoiceColumns}
              searchFields={['invoiceNumber', 'clientName']}
              filterOptions={[
                {
                  key: 'status',
                  label: 'Status',
                  options: [
                    { value: 'pending', label: 'Pending' },
                    { value: 'paid', label: 'Paid' },
                    { value: 'overdue', label: 'Overdue' }
                  ]
                }
              ]}
              onView={handleViewInvoice}
              onPrint={handlePrintInvoice}
            />
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
          </div>
        );

      default:
        return <div>Content not found</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar 
        userRole={user.role} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user.name}
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
      
      {printPreview && (
        <InvoicePrintPreview
          invoice={printPreview}
          onClose={() => setPrintPreview(null)}
          onPrint={() => {
            setPrintPreview(null);
            toast({
              title: "Invoice Printed",
              description: "Invoice has been sent to printer.",
            });
          }}
        />
      )}
    </div>
  );
};

export default Index;
