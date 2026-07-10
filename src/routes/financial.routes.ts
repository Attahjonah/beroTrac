import express from 'express';
import {
  clearPending,
  createCashOut,
  createExpense,
  createPending,
  createSale,
} from '../controllers/financial.controller';
import { authenticateToken, requireRole } from '../middlewares/auth';
import { financialWriteLimiter } from '../middlewares/rateLimit';

const router = express.Router();

router.use(authenticateToken);

/**
 * @swagger
 * /financial/sales:
 *   post:
 *     summary: Create a sale entry
 *     tags:
 *       - Financial
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [department, paymentMethod, amount]
 *             properties:
 *               department:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sale created successfully
 */
router.post('/sales', financialWriteLimiter, requireRole('admin'), createSale);

/**
 * @swagger
 * /financial/expenses:
 *   post:
 *     summary: Create an expense entry
 *     tags:
 *       - Financial
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [department, amount]
 *             properties:
 *               department:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Expense created successfully
 */
router.post('/expenses', financialWriteLimiter, requireRole('admin'), createExpense);

/**
 * @swagger
 * /financial/pending:
 *   post:
 *     summary: Create a pending entry
 *     tags:
 *       - Financial
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [department, amount]
 *             properties:
 *               department:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pending created successfully
 */
router.post('/pending', financialWriteLimiter, requireRole('admin'), createPending);

/**
 * @swagger
 * /financial/cash-out:
 *   post:
 *     summary: Create a cash out entry
 *     tags:
 *       - Financial
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [department, amount]
 *             properties:
 *               department:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cash out created successfully
 */
router.post('/cash-out', financialWriteLimiter, requireRole('admin'), createCashOut);

router.patch('/pending/:id/clear', requireRole('admin'), clearPending);

export default router;
