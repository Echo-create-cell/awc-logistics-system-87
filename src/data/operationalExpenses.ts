// Real operational expense data for September 2025
export interface OperationalExpense {
  id: number;
  description: string;
  fixedCostPerMonth: number;
  operationCost: number;
  suppliers: number;
  urgent: number;
  dueDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  comment?: string;
  currency: 'RWF' | 'USD';
}

export interface ClientPayment {
  id: number;
  clientName: string;
  amountUSD: number;
  amountRWF: number;
  dueDate?: string;
  comment?: string;
  status: 'pending' | 'received';
}

export const operationalExpenses: OperationalExpense[] = [];

export const pendingClientPayments: ClientPayment[] = [];

// Summary totals
export const expenseSummary = {
  totalRWF: 0,
  totalUSD: 0,
  suppliersRWF: 0,
  urgentRWF: 0,
  pendingClientPaymentsUSD: 0
};

// Exchange rate for calculations (approximate)
export const USD_TO_RWF_RATE = 1320;

// Helper functions
export const getTotalExpensesInUSD = () => {
  const rwfInUSD = expenseSummary.totalRWF / USD_TO_RWF_RATE;
  return rwfInUSD + expenseSummary.totalUSD;
};

export const getUrgentPaymentsInUSD = () => {
  const urgentRWFInUSD = expenseSummary.urgentRWF / USD_TO_RWF_RATE;
  const urgentUSD = operationalExpenses
    .filter(expense => expense.urgent > 0 && expense.currency === 'USD')
    .reduce((sum, expense) => sum + expense.urgent, 0);
  return urgentRWFInUSD + urgentUSD;
};

export const getOverdueExpenses = () => {
  return operationalExpenses.filter(expense => expense.status === 'overdue');
};

export const getCashFlowProjection = () => {
  const totalExpenses = getTotalExpensesInUSD();
  const expectedReceivables = expenseSummary.pendingClientPaymentsUSD;
  return expectedReceivables - totalExpenses;
};