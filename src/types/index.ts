
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'sales_director' | 'sales_agent' | 'finance_officer';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Quotation {
  id: string;
  volume: string;
  buyRate: number;
  currency: string;
  clientQuote: number;
  profit: number;
  profitPercentage: string;
  quoteSentBy: string;
  status: 'won' | 'lost' | 'pending';
  followUpDate: string;
  remarks: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface Invoice {
  id: string;
  quotationId: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
}
