import type { NextFunction, Request, Response } from 'express';
import prisma from '../config/prisma';
import {
  cashOutSchema,
  expenseSchema,
  pendingSchema,
  saleSchema,
} from '../validators/financial.validators';

const DUPLICATE_WINDOW_MS = Number(process.env.FINANCIAL_DUPLICATE_WINDOW_MS || 30000);
const recentFinancialRequests = new Map<string, number>();

function parseBody(schema: any, req: Request, res: Response) {
  try {
    return { value: schema.parse(req.body), error: null as null };
  } catch (error: any) {
    return {
      value: null,
      error: res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.issues,
      }),
    };
  }
}

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

export function validateAmountAgainstCashAtHand(amount: number, availableCashAtHand: number): boolean {
  return toNumber(amount) <= toNumber(availableCashAtHand);
}

function pruneRecentFinancialRequests(now: number): void {
  for (const [key, timestamp] of recentFinancialRequests.entries()) {
    if (now - timestamp > DUPLICATE_WINDOW_MS) {
      recentFinancialRequests.delete(key);
    }
  }
}

function isDuplicateFinancialRequest(req: Request, type: string, payload: Record<string, any>): boolean {
  const now = Date.now();
  pruneRecentFinancialRequests(now);

  const key = [
    type,
    req.ip || 'unknown',
    payload.department || '',
    payload.paymentMethod || '',
    Number(payload.amount || 0).toFixed(2),
    (payload.description || '').trim().toLowerCase(),
  ].join(':');

  const previousRequest = recentFinancialRequests.get(key);
  if (previousRequest && now - previousRequest < DUPLICATE_WINDOW_MS) {
    return true;
  }

  recentFinancialRequests.set(key, now);
  return false;
}

async function getAvailableCashAtHand(date = new Date()): Promise<number> {
  const monthBounds = getMonthBounds(date);

  const [cashSales, expenses, pending, cashOuts] = await Promise.all([
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
  ]);

  return (
    toNumber(cashSales._sum.amount) -
    toNumber(expenses._sum.amount) -
    toNumber(pending._sum.amount) -
    toNumber(cashOuts._sum.amount)
  );
}

export async function createSale(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = parseBody(saleSchema, req, res);
    if (parsed.error) {
      return;
    }

    if (isDuplicateFinancialRequest(req, 'sale', parsed.value)) {
      res.status(409).json({
        success: false,
        message: 'This sale was submitted too recently. Please wait a moment before trying again.',
      });
      return;
    }

    const sale = await prisma.sale.create({
      data: {
        department: parsed.value.department,
        paymentMethod: parsed.value.paymentMethod,
        amount: parsed.value.amount,
        description: parsed.value.description || null,
      },
    });

    await syncDepartmentSummary(sale.createdAt);

    res.status(201).json({ success: true, data: sale });
  } catch (error) {
    next(error);
  }
}

export async function createExpense(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = parseBody(expenseSchema, req, res);
    if (parsed.error) {
      return;
    }

    if (isDuplicateFinancialRequest(req, 'expense', parsed.value)) {
      res.status(409).json({
        success: false,
        message: 'This expense was submitted too recently. Please wait a moment before trying again.',
      });
      return;
    }

    const availableCashAtHand = await getAvailableCashAtHand();
    if (!validateAmountAgainstCashAtHand(parsed.value.amount, availableCashAtHand)) {
      res.status(400).json({
        success: false,
        message: 'Expense exceeds available cash at hand',
        data: { availableCashAtHand },
      });
      return;
    }

    const expense = await prisma.expense.create({
      data: {
        department: parsed.value.department,
        amount: parsed.value.amount,
        description: parsed.value.description || null,
      },
    });

    await syncDepartmentSummary(expense.createdAt);

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
}

export async function createPending(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = parseBody(pendingSchema, req, res);
    if (parsed.error) {
      return;
    }

    if (isDuplicateFinancialRequest(req, 'pending', parsed.value)) {
      res.status(409).json({
        success: false,
        message: 'This pending entry was submitted too recently. Please wait a moment before trying again.',
      });
      return;
    }

    const pending = await prisma.pending.create({
      data: {
        department: parsed.value.department,
        amount: parsed.value.amount,
        description: parsed.value.description || null,
      },
    });

    await syncDepartmentSummary(pending.createdAt);

    res.status(201).json({ success: true, data: pending });
  } catch (error) {
    next(error);
  }
}

export async function createCashOut(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = parseBody(cashOutSchema, req, res);
    if (parsed.error) {
      return;
    }

    if (isDuplicateFinancialRequest(req, 'cashOut', parsed.value)) {
      res.status(409).json({
        success: false,
        message: 'This cash out was submitted too recently. Please wait a moment before trying again.',
      });
      return;
    }

    const availableCashAtHand = await getAvailableCashAtHand();
    if (!validateAmountAgainstCashAtHand(parsed.value.amount, availableCashAtHand)) {
      res.status(400).json({
        success: false,
        message: 'Cash out exceeds available cash at hand',
        data: { availableCashAtHand },
      });
      return;
    }

    const cashOut = await prisma.cashOut.create({
      data: {
        amount: parsed.value.amount,
        description: parsed.value.description || null,
      },
    });

    await syncDepartmentSummary(cashOut.createdAt);

    res.status(201).json({ success: true, data: cashOut });
  } catch (error) {
    next(error);
  }
}

export async function clearPending(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const pending = await prisma.pending.update({
      where: { id: id || '' },
      data: { clearedAt: new Date(), cleared: true },
    });

    await syncDepartmentSummary(pending.clearedAt ?? new Date());

    res.json({ success: true, data: pending });
  } catch (error) {
    next(error);
  }
}

async function syncDepartmentSummary(date: Date): Promise<void> {
  const currentMonth = date.getMonth() + 1;
  const currentYear = date.getFullYear();
  const monthStart = new Date(currentYear, currentMonth - 1, 1);
  const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
  const departments = ['lodging', 'bar', 'kitchen', 'swimming', 'snooker', 'ps5', 'club', 'hall', 'gym'];

  const cashOuts = await prisma.cashOut.aggregate({
    where: {
      createdAt: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
    _sum: { amount: true },
  });

  await Promise.all(
    departments.map(async (department) => {
      const [sales, posSales, cashSales, expenses, pending] = await Promise.all([
        prisma.sale.aggregate({
          where: {
            department,
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: { amount: true },
        }),
        prisma.sale.aggregate({
          where: {
            department,
            paymentMethod: 'pos',
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: { amount: true },
        }),
        prisma.sale.aggregate({
          where: {
            department,
            paymentMethod: 'cash',
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: { amount: true },
        }),
        prisma.expense.aggregate({
          where: {
            department,
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: { amount: true },
        }),
        prisma.pending.aggregate({
          where: {
            department,
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: { amount: true },
        }),
      ]);

      const pendingCleared = await prisma.pending.aggregate({
        where: {
          department,
          cleared: true,
          clearedAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: { amount: true },
      });

      const pendingTotal = Number(pending._sum.amount || 0) - Number(pendingCleared._sum.amount || 0);

      await prisma.departmentSummary.upsert({
        where: {
          department_month_year: {
            department,
            month: currentMonth,
            year: currentYear,
          },
        },
        update: {
          sales: Number(sales._sum.amount || 0),
          posSales: Number(posSales._sum.amount || 0),
          cashSales: Number(cashSales._sum.amount || 0),
          expenses: Number(expenses._sum.amount || 0),
          pending: pendingTotal,
          cashOut: Number(cashOuts._sum.amount || 0),
        },
        create: {
          department,
          month: currentMonth,
          year: currentYear,
          sales: Number(sales._sum.amount || 0),
          posSales: Number(posSales._sum.amount || 0),
          cashSales: Number(cashSales._sum.amount || 0),
          expenses: Number(expenses._sum.amount || 0),
          pending: pendingTotal,
          cashOut: Number(cashOuts._sum.amount || 0),
        },
      });
    }),
  );
}
