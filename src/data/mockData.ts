
import { Quotation, User, Invoice } from '@/types';

export const mockQuotations: Quotation[] = [];

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

export const mockInvoices: Invoice[] = [];
