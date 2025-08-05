
import { Quotation, User, Invoice } from '@/types';

export const mockQuotations: Quotation[] = [];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@awclogistics.com',
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'John Sales Director',
    email: 'john@awclogistics.com',
    role: 'sales_director',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Mike Sales Agent',
    email: 'mike@awclogistics.com',
    role: 'sales_agent',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Lisa Finance Officer',
    email: 'lisa@awclogistics.com',
    role: 'finance_officer',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Partner User',
    email: 'partner@partner.com',
    role: 'partner',
    status: 'active',
    createdAt: new Date().toISOString()
  }
];

export const mockInvoices: Invoice[] = [];
