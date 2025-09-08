import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Receipt, 
  Calculator, 
  AlertTriangle, 
  FileText, 
  Download,
  TrendingUp,
  Building,
  CheckCircle
} from 'lucide-react';
import { User, Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { generateTaxReport } from './AccountingReportUtils';

interface TaxReportingProps {
  invoices: InvoiceData[];
  quotations: Quotation[];
  metrics: any;
  reportPeriod: { from: string; to: string };
  onPeriodChange: (period: { from: string; to: string }) => void;
  user: User;
}

const TaxReporting = ({ 
  invoices, 
  quotations, 
  metrics, 
  reportPeriod, 
  onPeriodChange, 
  user 
}: TaxReportingProps) => {
  const [taxType, setTaxType] = useState<'vat' | 'income' | 'quarterly' | 'annual'>('vat');
  const [taxJurisdiction, setTaxJurisdiction] = useState('federal');
  
  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  // Filter invoices by period
  const filteredInvoices = invoices.filter(invoice => {
    const date = new Date(invoice.issueDate);
    return date >= new Date(reportPeriod.from) && date <= new Date(reportPeriod.to);
  });

  // Calculate tax metrics
  const taxMetrics = {
    totalVAT: filteredInvoices.reduce((sum, inv) => sum + (inv.tva || 0), 0),
    totalRevenue: filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    taxableIncome: filteredInvoices.reduce((sum, inv) => sum + inv.subTotal, 0),
    estimatedIncomeTax: 0,
    quarterlyTax: 0,
    annualTax: 0
  };

  // Tax rate calculations (example rates)
  taxMetrics.estimatedIncomeTax = taxMetrics.taxableIncome * 0.21; // 21% corporate tax
  taxMetrics.quarterlyTax = taxMetrics.estimatedIncomeTax / 4;
  taxMetrics.annualTax = taxMetrics.estimatedIncomeTax;

  const handleExportTaxReport = async () => {
    await generateTaxReport(filteredInvoices, quotations, taxMetrics, user, reportPeriod);
  };

  // Tax compliance checklist
  const complianceItems = [
    { item: 'VAT Returns Filed', status: 'completed', dueDate: '2024-01-31' },
    { item: 'Quarterly Income Tax', status: 'pending', dueDate: '2024-04-15' },
    { item: 'Annual Tax Return', status: 'upcoming', dueDate: '2024-12-31' },
    { item: 'Payroll Tax Deposits', status: 'completed', dueDate: '2024-01-15' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" />
            Tax Reporting & Compliance
          </h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive tax reporting and compliance management system
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportTaxReport} className="flex items-center gap-2">
            <Download size={16} />
            Export Tax Report
          </Button>
        </div>
      </div>

      {/* Period and Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Reporting Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="tax-type">Tax Report Type</Label>
              <Select value={taxType} onValueChange={(value) => setTaxType(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vat">VAT/Sales Tax</SelectItem>
                  <SelectItem value="income">Income Tax</SelectItem>
                  <SelectItem value="quarterly">Quarterly Report</SelectItem>
                  <SelectItem value="annual">Annual Return</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="jurisdiction">Tax Jurisdiction</Label>
              <Select value={taxJurisdiction} onValueChange={setTaxJurisdiction}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="federal">Federal</SelectItem>
                  <SelectItem value="state">State</SelectItem>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="from-date">From Date</Label>
              <Input
                id="from-date"
                type="date"
                value={reportPeriod.from}
                onChange={(e) => onPeriodChange({ ...reportPeriod, from: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="to-date">To Date</Label>
              <Input
                id="to-date"
                type="date"
                value={reportPeriod.to}
                onChange={(e) => onPeriodChange({ ...reportPeriod, to: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-700">
              <Receipt className="h-4 w-4" />
              Total VAT Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {formatCurrency(taxMetrics.totalVAT)}
            </div>
            <p className="text-xs text-red-600 mt-1">
              From {filteredInvoices.length} invoices
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-700">
              <Calculator className="h-4 w-4" />
              Income Tax Liability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">
              {formatCurrency(taxMetrics.estimatedIncomeTax)}
            </div>
            <p className="text-xs text-orange-600 mt-1">
              21% corporate rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-700">
              <TrendingUp className="h-4 w-4" />
              Quarterly Tax
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {formatCurrency(taxMetrics.quarterlyTax)}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              Estimated quarterly payment
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700">
              <Building className="h-4 w-4" />
              Total Tax Liability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {formatCurrency(taxMetrics.totalVAT + taxMetrics.estimatedIncomeTax)}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Combined tax obligation
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tax Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Tax Breakdown by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <p className="font-medium text-red-700">Value Added Tax (VAT)</p>
                  <p className="text-sm text-red-600">Applied to services</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-700">{formatCurrency(taxMetrics.totalVAT)}</p>
                  <p className="text-xs text-red-600">Variable rates</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div>
                  <p className="font-medium text-orange-700">Corporate Income Tax</p>
                  <p className="text-sm text-orange-600">On taxable income</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-700">{formatCurrency(taxMetrics.estimatedIncomeTax)}</p>
                  <p className="text-xs text-orange-600">21% rate</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="font-medium text-gray-700">Payroll Taxes</p>
                  <p className="text-sm text-gray-600">Employee withholdings</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-700">{formatCurrency(15000)}</p>
                  <p className="text-xs text-gray-600">Estimated</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total Tax Liability</span>
                  <span className="text-blue-700">
                    {formatCurrency(taxMetrics.totalVAT + taxMetrics.estimatedIncomeTax + 15000)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Tax Compliance Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {item.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : item.status === 'pending' ? (
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    ) : (
                      <FileText className="h-5 w-5 text-blue-600" />
                    )}
                    <div>
                      <p className="font-medium">{item.item}</p>
                      <p className="text-sm text-muted-foreground">Due: {item.dueDate}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tax Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Tax Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-3">Month</th>
                  <th className="text-right p-3">Revenue</th>
                  <th className="text-right p-3">VAT Collected</th>
                  <th className="text-right p-3">Income Tax</th>
                  <th className="text-right p-3">Total Tax</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 12 }, (_, i) => {
                  const month = new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'long' });
                  const monthlyRevenue = taxMetrics.totalRevenue / 12;
                  const monthlyVAT = taxMetrics.totalVAT / 12;
                  const monthlyIncome = taxMetrics.estimatedIncomeTax / 12;
                  
                  return (
                    <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="p-3 font-medium">{month}</td>
                      <td className="p-3 text-right">{formatCurrency(monthlyRevenue)}</td>
                      <td className="p-3 text-right">{formatCurrency(monthlyVAT)}</td>
                      <td className="p-3 text-right">{formatCurrency(monthlyIncome)}</td>
                      <td className="p-3 text-right font-semibold">{formatCurrency(monthlyVAT + monthlyIncome)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 font-bold bg-blue-50">
                  <td className="p-3">TOTAL</td>
                  <td className="p-3 text-right">{formatCurrency(taxMetrics.totalRevenue)}</td>
                  <td className="p-3 text-right">{formatCurrency(taxMetrics.totalVAT)}</td>
                  <td className="p-3 text-right">{formatCurrency(taxMetrics.estimatedIncomeTax)}</td>
                  <td className="p-3 text-right text-blue-700">{formatCurrency(taxMetrics.totalVAT + taxMetrics.estimatedIncomeTax)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tax Planning Recommendations */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-700 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tax Planning Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-700">Optimization Strategies</h4>
              <ul className="space-y-2 text-sm text-green-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                  Consider quarterly tax payments to avoid penalties
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                  Track business expenses for tax deductions
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                  Review depreciation schedules for equipment
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                  Maintain detailed records for audit protection
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-green-700">Compliance Reminders</h4>
              <ul className="space-y-2 text-sm text-green-700">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-600" />
                  VAT returns due monthly or quarterly
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-600" />   
                  Estimated tax payments due quarterly
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-600" />
                  Annual tax return filing deadline
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-600" />
                  Keep receipts and documentation organized
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxReporting;