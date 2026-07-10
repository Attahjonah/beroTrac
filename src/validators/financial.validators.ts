import { z } from 'zod';

const departmentValues = [
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

const optionalDescription = z.string().trim().max(255).optional();

export const saleSchema = z.object({
  department: z.enum(departmentValues),
  paymentMethod: z.enum(['pos', 'cash']),
  amount: z.number().positive(),
  description: optionalDescription,
});

export const expenseSchema = z.object({
  department: z.enum(departmentValues),
  amount: z.number().positive(),
  description: optionalDescription,
});

export const pendingSchema = z.object({
  department: z.enum(departmentValues),
  amount: z.number().positive(),
  description: optionalDescription,
});

export const cashOutSchema = z.object({
  amount: z.number().positive(),
  description: optionalDescription,
});
