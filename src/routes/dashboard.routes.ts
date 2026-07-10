import express from 'express';
import { getSummary } from '../controllers/dashboard.controller';

const router = express.Router();

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Get the current monthly dashboard summary
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Dashboard summary returned successfully
 */
router.get('/summary', getSummary);

export default router;
