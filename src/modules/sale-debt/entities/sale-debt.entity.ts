import { Prisma } from '@/generated/prisma/client';

export const SalePaymentSelect = {
  id: true,
  debtId: true,
  amount: true,
  payMethod: true,
  notes: true,
  createdAt: true,
  createdBy: true,
};

export const SaleDebtSelect = {
  id: true,
  totalAmount: true,
  paidAmount: true,
  status: true,
  active: true,
  createdAt: true,
  order: {
    select: {
      id: true,
      amount: true,
      paymentType: true,
      createdAt: true,
    },
  },
  customer: {
    select: {
      user: {
        select: { name: true, lastName: true, numberDocument: true },
      },
    },
  },
  branch: { select: { id: true, name: true } },
  payments: { select: SalePaymentSelect },
};

export type SaleDebtType = Prisma.SaleDebtGetPayload<{ select: typeof SaleDebtSelect }>;
export type SalePaymentType = Prisma.SalePaymentGetPayload<{ select: typeof SalePaymentSelect }>;
