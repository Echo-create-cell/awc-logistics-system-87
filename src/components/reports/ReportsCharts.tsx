
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { ReportData } from '@/types/reports';

interface ReportsChartsProps {
  reportData: ReportData;
}

const ReportsCharts = ({ reportData }: ReportsChartsProps) => {
  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  // Ensure we have valid data for pie chart
  const pieData = [
    { name: 'Paid', value: reportData.metrics.paidInvoices || 0, color: 'hsl(160, 84%, 39%)' },
    { name: 'Pending', value: reportData.metrics.pendingInvoices || 0, color: 'hsl(43, 96%, 56%)' },
    { name: 'Overdue', value: reportData.metrics.overdueInvoices || 0, color: 'hsl(0, 84%, 60%)' }
  ].filter(item => item.value > 0); // Only show segments with data

  // Ensure we have data for charts
  const hasMonthlyData = reportData.monthlyTrends && reportData.monthlyTrends.length > 0;
  const hasClientData = reportData.topClients && reportData.topClients.length > 0;
  const hasPieData = pieData.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-in fade-in-50 duration-500">
      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue & Profit Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {hasMonthlyData ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(160, 84%, 39%)" name="Revenue" strokeWidth={3} />
                <Line type="monotone" dataKey="profit" stroke="hsl(221, 83%, 53%)" name="Profit" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <p>No data available for the selected period</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {hasPieData ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <p>No invoice data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Clients */}
      <Card>
        <CardHeader>
          <CardTitle>Top Clients by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {hasClientData ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.topClients.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="revenue" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <p>No client revenue data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Quotations */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Quotation Volume</CardTitle>
        </CardHeader>
        <CardContent>
          {hasMonthlyData ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quotations" fill="hsl(43, 96%, 56%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <p>No quotation data available for the selected period</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsCharts;
