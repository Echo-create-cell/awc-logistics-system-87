
import { Quotation, User, Invoice } from '@/types';

export const mockQuotations: Quotation[] = [
  {
    id: '1',
    volume: '2.4KGS',
    buyRate: 0,
    currency: '$',
    clientQuote: 3223.00,
    profit: 3223.00,
    profitPercentage: '#DIV/0!',
    quoteSentBy: 'JOHN NDAYAMABAJE',
    status: 'won',
    followUpDate: '2024-06-15',
    remarks: 'Airfreight',
    createdAt: '2024-06-01'
  },
  {
    id: '2',
    volume: '422KGS',
    buyRate: 0,
    currency: '$',
    clientQuote: 4699.00,
    profit: 4699.00,
    profitPercentage: '#DIV/0!',
    quoteSentBy: 'JOHN NDAYAMABAJE',
    status: 'won',
    followUpDate: '2024-06-15',
    remarks: 'Airfreight',
    createdAt: '2024-06-01'
  },
  {
    id: '3',
    volume: '47.6KGS',
    buyRate: 0,
    currency: 'RWF',
    clientQuote: 1274400.00,
    profit: 1274400.00,
    profitPercentage: '#DIV/0!',
    quoteSentBy: 'RONNY TWAHIRWA',
    status: 'won',
    followUpDate: '2024-06-15',
    remarks: 'Airfreight',
    createdAt: '2024-06-01'
  },
  {
    id: '4',
    volume: '20FT',
    buyRate: 0,
    currency: '$',
    clientQuote: 7250.00,
    profit: 7250.00,
    profitPercentage: '#DIV/0!',
    quoteSentBy: 'ANDY NUMA',
    status: 'pending',
    followUpDate: '2024-06-20',
    remarks: 'Still in negotiations',
    createdAt: '2024-06-10'
  },
  {
    id: '5',
    volume: '20FT',
    buyRate: 0,
    currency: '$',
    clientQuote: 8690.00,
    profit: 8690.00,
    profitPercentage: '#DIV/0!',
    quoteSentBy: 'ANDY NUMA',
    status: 'pending',
    followUpDate: '2024-06-20',
    remarks: 'Still in negotiations',
    createdAt: '2024-06-10'
  },
  {
    id: '6',
    volume: '200KGS',
    buyRate: 0,
    currency: '$',
    clientQuote: 3024.00,
    profit: 3024.00,
    profitPercentage: '#DIV/0!',
    quoteSentBy: 'ANDY NUMA',
    status: 'pending',
    followUpDate: '2024-06-20',
    remarks: 'Still in negotiations',
    createdAt: '2024-06-10'
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Admin',
    email: 'admin@quotationpro.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Sarah Director',
    email: 'sarah@quotationpro.com',
    role: 'sales_director',
    status: 'active',
    createdAt: '2024-02-01'
  },
  {
    id: '3',
    name: 'Mike Agent',
    email: 'mike@quotationpro.com',
    role: 'sales_agent',
    status: 'active',
    createdAt: '2024-02-15'
  },
  {
    id: '4',
    name: 'Lisa Finance',
    email: 'lisa@quotationpro.com',
    role: 'finance_officer',
    status: 'active',
    createdAt: '2024-03-01'
  },
  {
    id: '5',
    name: 'Alex Partner',
    email: 'alex@partner.com',
    role: 'partner',
    status: 'active',
    createdAt: '2024-03-15'
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: 'INV-001',
    quotationId: '1',
    invoiceNumber: 'INV-2024-001',
    clientName: 'ABC Corporation',
    amount: 3223.00,
    currency: '$',
    issueDate: '2024-06-15',
    dueDate: '2024-07-15',
    status: 'paid'
  },
  {
    id: 'INV-002',
    quotationId: '2',
    invoiceNumber: 'INV-2024-002',
    clientName: 'XYZ Ltd',
    amount: 4699.00,
    currency: '$',
    issueDate: '2024-06-16',
    dueDate: '2024-07-16',
    status: 'pending'
  }
];
