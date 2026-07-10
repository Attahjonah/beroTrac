import type { NextFunction, Request, Response } from 'express';
import prisma from '../config/prisma';
import { getCachedValue, setCachedValue } from '../utils/cache';

const DEPARTMENTS = [
  'lodging',
  'bar',
  'kitchen',
  'swimming',
  'snooker',
  'ps5',
  'club',
  'hall',
  'gym',
] as const;

function getMonthBounds(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();

  return {
    start: new Date(year, month, 1),
    end: new Date(year, month + 1, 0, 23, 59, 59, 999),
  };
}

function toNumber(value: unknown): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return Number(value);
  }

  if (typeof value === 'object' && 'toString' in value && typeof (value as { toString: unknown }).toString === 'function') {
    return Number((value as { toString: () => string }).toString());
  }

  return Number(value);
}

export function calculateCashAtHand({ cash, expenses, pending, cashOut }: { cash: number; expenses: number; pending: number; cashOut: number }) {
  return toNumber(cash) - toNumber(expenses) - toNumber(pending) - toNumber(cashOut);
}

export async function getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const monthBounds = getMonthBounds();
    const cacheKey = `dashboard-summary:${monthBounds.start.toISOString()}`;
    const cached = await getCachedValue(cacheKey);

    if (cached) {
      res.json({ success: true, data: cached, cached: true });
      return;
    }

    const [sales, expenses, pending, cashOuts, departments] = await Promise.all([
      Promise.all([
        prisma.sale.aggregate({
          where: {
            createdAt: {
              gte: monthBounds.start,
              lte: monthBounds.end,
            },
          },
          _sum: { amount: true },
        }),
        prisma.sale.aggregate({
          where: {
            paymentMethod: 'pos',
            createdAt: {
              gte: monthBounds.start,
              lte: monthBounds.end,
            },
          },
          _sum: { amount: true },
        }),
        prisma.sale.aggregate({
          where: {
            paymentMethod: 'cash',
            createdAt: {
              gte: monthBounds.start,
              lte: monthBounds.end,
            },
          },
          _sum: { amount: true },
        }),
      ]),
      prisma.expense.aggregate({
        where: {
          createdAt: {
            gte: monthBounds.start,
            lte: monthBounds.end,
          },
        },
        _sum: { amount: true },
      }),
      prisma.pending.aggregate({
        where: {
          createdAt: {
            gte: monthBounds.start,
            lte: monthBounds.end,
          },
          cleared: false,
        },
        _sum: { amount: true },
      }),
      prisma.cashOut.aggregate({
        where: {
          createdAt: {
            gte: monthBounds.start,
            lte: monthBounds.end,
          },
        },
        _sum: { amount: true },
      }),
      prisma.departmentSummary.findMany({
        where: { month: monthBounds.start.getMonth() + 1, year: monthBounds.start.getFullYear() },
        orderBy: { department: 'asc' },
      }),
    ]);

    const [salesSummary, posSummary, cashSummary] = sales;
    const totalSales = toNumber(salesSummary._sum.amount);
    const totalPos = toNumber(posSummary._sum.amount);
    const totalCash = toNumber(cashSummary._sum.amount);
    const totalExpenses = toNumber(expenses._sum.amount);
    const totalPending = toNumber(pending._sum.amount);
    const totalCashOut = toNumber(cashOuts._sum.amount);

    const payload = {
      month: monthBounds.start.getMonth() + 1,
      year: monthBounds.start.getFullYear(),
      totals: {
        sales: totalSales,
        pos: totalPos,
        cash: totalCash,
        expenses: totalExpenses,
        pending: totalPending,
        cashOut: totalCashOut,
        cashAtHand: calculateCashAtHand({
          cash: totalCash,
          expenses: totalExpenses,
          pending: totalPending,
          cashOut: totalCashOut,
        }),
      },
      departments: DEPARTMENTS.map((department) => {
        const record = departments.find((entry) => entry.department === department);

        return {
          department,
          sales: toNumber(record?.sales),
          pos: toNumber(record?.posSales),
          cash: toNumber(record?.cashSales),
          expenses: toNumber(record?.expenses),
          pending: toNumber(record?.pending),
          cashOut: toNumber(record?.cashOut),
        };
      }),
    };

    await setCachedValue(cacheKey, payload, 60);

    res.json({ success: true, data: payload });
  } catch (error) {
    const fallbackPayload = {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      totals: {
        sales: 0,
        pos: 0,
        cash: 0,
        expenses: 0,
        pending: 0,
        cashOut: 0,
        cashAtHand: 0,
      },
      departments: DEPARTMENTS.map((department) => ({
        department,
        sales: 0,
        pos: 0,
        cash: 0,
        expenses: 0,
        pending: 0,
        cashOut: 0,
      })),
    };

    res.json({ success: true, data: fallbackPayload, fallback: true });
  }
}
